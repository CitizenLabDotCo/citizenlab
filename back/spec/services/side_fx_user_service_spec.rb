# frozen_string_literal: true

require 'rails_helper'

describe SideFxUserService do
  let(:service) { described_class.new }

  describe 'after_create' do
    it "logs a 'created' action job with type: 'email' when a normal user is created" do
      user = create(:user)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'created', user, user.created_at.to_i, payload: { type: 'email' })
        .exactly(1).times
    end

    it "logs a 'created' action job with type: 'email_only' when a user is created without a password" do
      user = create(:user, password: nil)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
              .with(user, 'created', user, user.created_at.to_i, payload: { type: 'email_only' })
              .exactly(1).times
    end

    it "logs a 'created' action job with type: 'sso' when a user is created with sso" do
      user = create(:user)
      user.identities << create(:facebook_identity)

      expect { service.after_create(user, user) }
        .to enqueue_job(LogActivityJob)
              .with(user, 'created', user, user.created_at.to_i, payload: { type: 'sso', method: 'facebook' })
              .exactly(1).times
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user = create(:user, domicile: area.id)

      expect do
        service.after_create user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when a user is resubmitted" do
      user = create(:user)

      expect { service.after_update(user, user) }
        .to enqueue_job(LogActivityJob)
        .with(user, 'changed', user, user.updated_at.to_i)
        .exactly(1).times
    end

    it 'creates a follower for the domicile' do
      area = create(:area)
      user = create(:user, domicile: area.id)

      expect do
        service.after_update user, user
      end.to change(Follower, :count).from(0).to(1)

      expect(user.follows.pluck(:followable_id)).to contain_exactly area.id
    end
  end

  describe 'before_destroy' do
    before do
      @status_review_pending = create(:initiative_status_review_pending)
      @status_changes_requested = create(:initiative_status_changes_requested)
      @status_proposed = create(:initiative_status_proposed)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_expired = create(:initiative_status_expired)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)
    end

    it "destroys the user's reactions to initiatives in a voteable status" do
      user = create(:user)
      review_pending_initiative    = create(:initiative, initiative_status: @status_review_pending)
      changes_requested_initiative = create(:initiative, initiative_status: @status_changes_requested)
      proposed_initiative          = create(:initiative, initiative_status: @status_proposed)
      threshold_reached_initiative = create(:initiative, initiative_status: @status_threshold_reached)
      expired_initiative           = create(:initiative, initiative_status: @status_expired)
      answered_initiative          = create(:initiative, initiative_status: @status_answered)
      ineligible_initiative        = create(:initiative, initiative_status: @status_ineligible)
      _reaction1 = create(:reaction, user: user, reactable: review_pending_initiative)
      _reaction2 = create(:reaction, user: user, reactable: changes_requested_initiative)
      _reaction3 = create(:reaction, user: user, reactable: proposed_initiative)
      reaction4  = create(:reaction, user: user, reactable: threshold_reached_initiative)
      reaction5  = create(:reaction, user: user, reactable: expired_initiative)
      reaction6  = create(:reaction, user: user, reactable: answered_initiative)
      reaction7  = create(:reaction, user: user, reactable: ineligible_initiative)

      service.before_destroy(user, user)

      expect(user.reactions.pluck(:id)).to match_array [reaction4.id, reaction5.id, reaction6.id, reaction7.id]
    end
  end
end
