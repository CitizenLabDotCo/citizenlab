# frozen_string_literal: true

require 'rails_helper'

describe AccountMergeService do
  subject(:service) { described_class.new }

  # An email-less SSO account: an identity, a verification, and whatever it has
  # managed to participate in before being asked for an email.
  let!(:source) do
    create(:user, registration_completed_at: Time.zone.now).tap do |user|
      user.update_columns(email: nil, password_digest: nil)
      create(:identity, user: user, provider: 'clave_unica', uid: '11111')
    end
  end

  let!(:target) { create(:user, email: 'existing@example.org') }

  let(:confirmation) do
    create(:merge_account_confirmation, user: source, target_email: 'existing@example.org')
  end

  def merge!
    service.merge!(source: source, confirmation: confirmation)
  end

  it 'moves the identity and verification, then deletes the source' do
    create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')

    expect(merge!).to eq target

    expect { source.reload }.to raise_error ActiveRecord::RecordNotFound
    expect(target.reload.identities.pluck(:uid)).to eq ['11111']
    expect(target.verifications.active.pluck(:hashed_uid)).to eq ['aaa']
  end

  # users.verified is written by SideFxVerificationService#after_create, not by a
  # callback on Verification, so moving the row is not enough on its own.
  it 'marks the target verified' do
    create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')
    expect(target.verified).to be false

    merge!

    expect(target.reload.verified).to be true
  end

  it 'rotates the surviving account token, since it gained a new way to sign in' do
    expect { merge! }.to change { target.reload.token_expiry_key }
  end

  it 'destroys the consumed confirmation' do
    confirmation
    merge!
    expect(MergeAccountConfirmation.count).to eq 0
  end

  describe 'reactions' do
    let(:idea) { create(:idea) }

    it 'moves a reaction the target does not have' do
      create(:reaction, user: source, reactable: idea, mode: 'up')

      merge!

      expect(Reaction.where(user_id: target.id).pluck(:reactable_id)).to eq [idea.id]
    end

    # The unique index is (reactable_type, reactable_id, user_id) - it is NOT
    # scoped by mode, unlike Reaction's own validation. Deduping on mode would
    # leave two rows for one user on one idea, which the database rejects.
    it 'drops a reaction on something the target already reacted to, whatever the mode' do
      create(:reaction, user: target, reactable: idea, mode: 'down')
      create(:reaction, user: source, reactable: idea, mode: 'up')

      expect { merge! }.not_to raise_error

      reactions = Reaction.where(user_id: target.id, reactable_id: idea.id)
      expect(reactions.count).to eq 1
      expect(reactions.first.mode).to eq 'down'
      expect(idea.reload.likes_count).to eq 0
    end
  end

  describe 'followers' do
    it 'moves follows and keeps followings_count consistent' do
      shared_project = create(:project)
      create(:follower, user: target, followable: shared_project)
      create(:follower, user: source, followable: shared_project)
      create(:follower, user: source, followable: create(:project))

      merge!

      target.reload
      expect(target.follows.count).to eq 2
      # update_all bypasses counter_culture, so this is recomputed by hand.
      expect(target.followings_count).to eq target.follows.count
    end
  end

  describe 'authored content' do
    it 'moves ideas and recomputes the author hash' do
      idea = create(:idea, author: source)

      merge!

      idea.reload
      expect(idea.author_id).to eq target.id
      expect(idea.author_hash).to eq Idea.create_author_hash(target.id, idea.project_id, false)
    end

    it 'moves comments and recomputes the author hash' do
      comment = create(:comment, author: source)

      merge!

      comment.reload
      expect(comment.author_id).to eq target.id
      expect(comment.author_hash).to eq Comment.create_author_hash(target.id, comment.try(:project_id), false)
    end

    it 'leaves anonymous ideas alone, since they carry no author' do
      anonymous = create(:idea, author: nil, anonymous: true)

      merge!

      expect(anonymous.reload.author_id).to be_nil
    end
  end

  describe 'other participation' do
    it 'moves baskets and dedups per phase' do
      basket = create(:basket, user: source)

      merge!

      expect(basket.reload.user_id).to eq target.id
    end

    it 'moves cosponsorships' do
      cosponsorship = create(:cosponsorship, user: source)

      merge!

      expect(cosponsorship.reload.user_id).to eq target.id
    end

    it 'dedups idea exposures on (idea_id, phase_id)' do
      idea = create(:idea)
      phase = create(:phase)
      create(:idea_exposure, user: target, idea: idea, phase: phase)
      create(:idea_exposure, user: source, idea: idea, phase: phase)
      create(:idea_exposure, user: source, idea: create(:idea), phase: phase)

      merge!

      expect(IdeaExposure.where(user_id: target.id).count).to eq 2
    end
  end

  describe 'locked identity attributes' do
    # A verification method that locks the name means the target can no longer
    # edit it, so it has to end up holding what the provider actually asserted.
    it 'overwrites the name the target chose with the verified one' do
      source.update_columns(first_name: 'Robert', last_name: 'Smit')
      target.update!(first_name: 'Bob', last_name: 'Smith')
      create(:verification, user: source, method_name: 'bosa_fas', hashed_uid: 'aaa')

      merge!

      target.reload
      expect(target.first_name).to eq 'Robert'
      expect(target.last_name).to eq 'Smit'
    end

    it 'leaves the name alone when the method locks nothing' do
      target.update!(first_name: 'Bob')
      create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')

      merge!

      expect(target.reload.first_name).to eq 'Bob'
    end
  end

  describe 'refusals' do
    it 'raises and changes nothing when the target may not be merged into' do
      # Free the address before handing it to an admin: the merge resolves its
      # target by email, so it is the admin that must own it by the time it runs.
      target.update!(email: 'somewhere-else@example.org')
      admin = create(:admin, email: 'existing@example.org')

      expect { merge! }.to raise_error described_class::IneligibleError

      expect(source.reload).to be_present
      expect(admin.reload.identities).to be_empty
    end

    # The last line of defence: source.destroy! silently nullifies ideas and
    # comments, so anything left behind must abort rather than be lost.
    it 'refuses to delete the source if a surface was left behind' do
      idea = create(:idea, author: source)
      # The guard only ever fires on programmer error - a surface added to the
      # model layer but not to MOVES - so provoking it means breaking a mover.
      allow(service).to receive(:move_and_rehash!).and_return(0) # rubocop:disable RSpec/SubjectStub

      expect { merge! }.to raise_error described_class::IncompleteMergeError

      expect(source.reload).to be_present
      expect(idea.reload.author_id).to eq source.id
    end
  end

  # The address stopped belonging to anyone while the code was outstanding, so
  # there is nothing to merge into - but the user still proved they own it.
  describe 'when the target no longer exists' do
    it 'promotes the email onto the source instead of merging' do
      confirmation
      target.destroy!

      expect(merge!).to eq source

      source.reload
      expect(source.email).to eq 'existing@example.org'
      expect(source.confirmation_required).to be false
      expect(source.email_confirmed_at).to be_present
    end
  end
end
