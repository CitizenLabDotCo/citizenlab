# frozen_string_literal: true

require 'rails_helper'

describe AccountMergeEligibilityService do
  subject(:service) { described_class.new }

  # The shape the merge flow always starts from: signed in through an SSO method
  # that returned no email, so there is nothing but the identity to go on.
  let(:source) do
    create(:user, email: nil, password: nil, registration_completed_at: Time.zone.now).tap do |user|
      user.update_columns(email: nil, password_digest: nil)
      create(:identity, user: user, provider: 'clave_unica', uid: '11111')
    end
  end

  let(:target) { create(:user) }

  def reason(source_user = source, target_user = target)
    service.ineligibility_reason(source: source_user, target: target_user)
  end

  it 'allows an ordinary target' do
    expect(reason).to be_nil
    expect(service.eligible?(source: source, target: target)).to be true
  end

  describe 'source rules' do
    it 'refuses a source with no identity, which is not an SSO account at all' do
      plain_user = create(:user)
      expect(reason(plain_user)).to eq :source_not_sso
    end

    it 'refuses a source that already has an email' do
      source.update_columns(email: 'sso@example.org')
      expect(reason).to eq :source_has_email
    end

    # The scope fence: this is what keeps the shared request_code_new_email
    # endpoint from offering a merge during an ordinary profile email change.
    it 'refuses a source that has a password' do
      source.update_columns(password_digest: BCrypt::Password.create('democracy2.0'))
      expect(reason).to eq :source_has_password
    end

    it 'refuses a source carrying roles, since the merge would delete it' do
      source.update_columns(roles: [{ type: 'admin' }])
      expect(reason).to eq :source_has_roles
    end

    it 'reports source_eligible? without needing a target' do
      expect(service.source_eligible?(source)).to be true
      expect(service.source_eligible?(create(:user))).to be false
    end
  end

  describe 'target rules' do
    it 'refuses an admin target' do
      expect(reason(source, create(:admin))).to eq :target_is_admin_or_moderator
    end

    it 'refuses a project moderator target' do
      expect(reason(source, create(:project_moderator))).to eq :target_is_admin_or_moderator
    end

    it 'refuses a blocked target' do
      target.update!(block_end_at: 1.week.from_now)
      expect(reason).to eq :target_blocked
    end

    it 'refuses a target with a pending invite' do
      invitee = create(:invite).invitee
      expect(reason(source, invitee)).to eq :target_is_invitee
    end

    # The shape AuthenticationService#prevent_user_account_hijacking guards
    # against: someone claimed this address with a password and never proved
    # they own it.
    it 'refuses a target that set a password but never confirmed the email' do
      target.update_columns(
        email_confirmed_at: nil,
        confirmation_required: true,
        password_digest: BCrypt::Password.create('democracy2.0')
      )
      expect(reason).to eq :target_unconfirmed_password_account
    end

    it 'refuses when the target is already verified as somebody else' do
      create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')
      create(:verification, user: target, method_name: 'cow', hashed_uid: 'bbb')
      expect(reason).to eq :verification_conflict
    end

    it 'allows when the target holds the same verification uid' do
      create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')
      create(:verification, user: target, method_name: 'cow', hashed_uid: 'aaa')
      expect(reason).to be_nil
    end

    it 'allows when the target is verified through a different method' do
      create(:verification, user: source, method_name: 'cow', hashed_uid: 'aaa')
      create(:verification, user: target, method_name: 'bogus', hashed_uid: 'bbb')
      expect(reason).to be_nil
    end

    # Login-only SSO methods produce an identity but no verification, so the
    # verification rule alone would let two different people collide.
    it 'refuses when the target has a different identity for the same provider' do
      create(:identity, user: target, provider: 'clave_unica', uid: '22222')
      expect(reason).to eq :identity_conflict
    end

    it 'allows when the target has an identity for another provider' do
      create(:identity, user: target, provider: 'facebook', uid: '22222')
      expect(reason).to be_nil
    end

    it 'refuses merging an account into itself' do
      expect(reason(source, source)).to eq :target_is_source
    end

    it 'refuses when there is no target' do
      expect(reason(source, nil)).to eq :target_missing
    end
  end
end
