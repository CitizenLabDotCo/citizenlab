# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestCodePolicy do
  subject { described_class.new(user, record) }

  describe '#request_code_email?' do
    # The public flow: `record` is the account owning the submitted email, and
    # there is no current_user.
    context 'without an authenticated user' do
      let(:user) { nil }

      it 'permits requesting a code for an existing account' do
        record = create(:user, email: 'test@test.com')
        expect(described_class.new(nil, record)).to permit(:request_code_email)
      end

      it 'permits requesting a code for a full account (password set + confirmed)' do
        record = create(:user, email: 'test@test.com')
        expect(record.password_digest).not_to be_nil
        expect(record.confirmation_required?).to be false
        expect(described_class.new(nil, record)).to permit(:request_code_email)
      end

      it 'does not permit when no account matches the email' do
        expect(described_class.new(nil, nil)).not_to permit(:request_code_email)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        record = create(:unconfirmed_user)
        record.find_or_create_confirmation(:email_confirmation).update!(code_reset_count: 4)
        expect(described_class.new(nil, record)).not_to permit(:request_code_email)
      end

      it 'does not permit when password_login is disabled' do
        record = create(:user, email: 'test@test.com')
        allow(AppConfiguration.instance).to receive(:feature_activated?).with('password_login').and_return(false)
        expect(described_class.new(nil, record)).not_to permit(:request_code_email)
      end
    end

    # An authenticated user re-confirming their own email goes through
    # request_reconfirm_code_email? instead, so this action rejects them
    # outright rather than checking ownership.
    context 'with an authenticated user' do
      it 'does not permit requesting a code for their own account' do
        user = create(:user, email: 'test@test.com')
        expect(described_class.new(user, user)).not_to permit(:request_code_email)
      end

      it 'does not permit requesting a code for a different account' do
        requester = create(:user, email: 'requester@test.com')
        other_user = create(:user, email: 'other@test.com')
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_email)
      end
    end
  end

  describe '#request_reconfirm_code_email?' do
    it 'permits the authenticated user to request a code for their own email' do
      user = create(:user, email: 'test@test.com')
      expect(described_class.new(user, user)).to permit(:request_reconfirm_code_email)
    end

    # Unlike request_code_email?: an account created through SSO must still be
    # able to re-confirm.
    it 'permits when password_login is disabled' do
      user = create(:user, email: 'test@test.com')
      SettingsService.new.deactivate_feature!('password_login')
      expect(described_class.new(user, user)).to permit(:request_reconfirm_code_email)
    end

    it 'does not permit without an authenticated user' do
      expect(described_class.new(nil, nil)).not_to permit(:request_reconfirm_code_email)
    end

    it 'does not permit when the user has no email' do
      user = create(:user, :with_confirmed_phone, email: nil)
      expect(described_class.new(user, user)).not_to permit(:request_reconfirm_code_email)
    end

    it 'does not permit once the code_reset_count limit is reached' do
      user = create(:user, email: 'test@test.com')
      user.find_or_create_confirmation(:email_confirmation).update!(code_reset_count: 4)
      expect(described_class.new(user, user)).not_to permit(:request_reconfirm_code_email)
    end
  end

  describe '#request_code_phone?' do
    include_context 'with sms feature enabled'

    context 'without an authenticated user' do
      before { SettingsService.new.activate_feature!('sms_login') }

      it 'permits requesting a code for an existing account' do
        record = create(:unconfirmed_phone_user)
        expect(described_class.new(nil, record)).to permit(:request_code_phone)
      end

      it 'does not permit when no account matches the phone number' do
        expect(described_class.new(nil, nil)).not_to permit(:request_code_phone)
      end

      it 'does not permit when the account has no phone number' do
        record = create(:user)
        expect(described_class.new(nil, record)).not_to permit(:request_code_phone)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        record = create(:unconfirmed_phone_user)
        record.find_or_create_confirmation(:phone_confirmation).update!(code_reset_count: 4)
        expect(described_class.new(nil, record)).not_to permit(:request_code_phone)
      end

      it 'does not permit when the sms feature is disabled' do
        SettingsService.new.deactivate_feature!('sms')
        record = create(:unconfirmed_phone_user)
        expect(described_class.new(nil, record)).not_to permit(:request_code_phone)
      end

      it 'does not permit when the sms_login feature is disabled' do
        SettingsService.new.deactivate_feature!('sms_login')
        record = create(:unconfirmed_phone_user)
        expect(described_class.new(nil, record)).not_to permit(:request_code_phone)
      end

      it 'does not permit when the password_login feature is disabled' do
        SettingsService.new.deactivate_feature!('password_login')
        record = create(:unconfirmed_phone_user)
        expect(described_class.new(nil, record)).not_to permit(:request_code_phone)
      end
    end

    context 'with an authenticated user' do
      it 'does not permit requesting a code for their own account' do
        user = create(:user, :with_confirmed_phone)
        expect(described_class.new(user, user)).not_to permit(:request_code_phone)
      end

      it 'does not permit requesting a code for a different account' do
        requester = create(:user, :with_confirmed_phone)
        other_user = create(:user, :with_confirmed_phone)
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_phone)
      end
    end
  end

  describe '#request_reconfirm_code_phone?' do
    include_context 'with sms feature enabled'

    it 'permits the authenticated user to request a code for their own number' do
      user = create(:user, :with_confirmed_phone)
      expect(described_class.new(user, user)).to permit(:request_reconfirm_code_phone)
    end

    # Confirmations are created on demand, so a user who has never requested a
    # phone code has no PhoneConfirmation row at all.
    it 'permits when the user has a phone but no confirmation record yet' do
      user = create(:user, :with_confirmed_phone)
      expect(user.phone_confirmation).to be_nil
      expect(described_class.new(user, user)).to permit(:request_reconfirm_code_phone)
    end

    # Unlike request_code_phone?, which is a login path.
    it 'permits when the sms_login and password_login features are disabled' do
      SettingsService.new.deactivate_feature!('sms_login')
      SettingsService.new.deactivate_feature!('password_login')
      user = create(:user, :with_confirmed_phone)
      expect(described_class.new(user, user)).to permit(:request_reconfirm_code_phone)
    end

    it 'does not permit without an authenticated user' do
      expect(described_class.new(nil, nil)).not_to permit(:request_reconfirm_code_phone)
    end

    it 'does not permit when the user has no phone' do
      user = create(:user)
      expect(described_class.new(user, user)).not_to permit(:request_reconfirm_code_phone)
    end

    it 'does not permit once the code_reset_count limit is reached' do
      user = create(:user, :with_confirmed_phone)
      user.find_or_create_confirmation(:phone_confirmation).update!(code_reset_count: 4)
      expect(described_class.new(user, user)).not_to permit(:request_reconfirm_code_phone)
    end

    it 'does not permit when the sms feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')
      user = create(:user, :with_confirmed_phone)
      expect(described_class.new(user, user)).not_to permit(:request_reconfirm_code_phone)
    end
  end
end
