# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestCodePolicy do
  subject { described_class.new(user, record) }

  describe '#request_code_email?' do
    # Case 1: email param + no authenticated user (the public flow). `record` is
    # the account owning the submitted email; there is no current_user.
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

    # Cases 2 and 3: an authenticated user. The code may only be sent to that
    # same user, whether the email was omitted (record == current_user) or passed
    # explicitly and resolved to their own account.
    context 'with an authenticated user' do
      it 'permits requesting a code for their own account (record == user)' do
        user = create(:user, email: 'test@test.com')
        expect(described_class.new(user, user)).to permit(:request_code_email)
      end

      it 'does not permit requesting a code for a different account' do
        requester = create(:user, email: 'requester@test.com')
        other_user = create(:user, email: 'other@test.com')
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_email)
      end

      it 'does not permit requesting a code for a different account even when that account is unconfirmed' do
        requester = create(:user, email: 'requester@test.com')
        other_user = create(:unconfirmed_user, email: 'other@test.com')
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_email)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        user = create(:unconfirmed_user)
        user.find_or_create_confirmation(:email_confirmation).update!(code_reset_count: 4)
        expect(described_class.new(user, user)).not_to permit(:request_code_email)
      end
    end
  end

  describe '#request_code_phone?' do
    include_context 'with sms feature enabled'

    context 'without an authenticated user' do
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
    end

    context 'with an authenticated user' do
      it 'permits requesting a code for their own account (record == user)' do
        user = create(:user, :with_confirmed_phone)
        expect(described_class.new(user, user)).to permit(:request_code_phone)
      end

      it 'does not permit requesting a code for a different account' do
        requester = create(:user, :with_confirmed_phone)
        other_user = create(:user, :with_confirmed_phone)
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_phone)
      end

      # Confirmations are created on demand, so a user who has never requested a
      # phone code has no PhoneConfirmation row at all.
      it 'permits when the user has a phone but no confirmation record yet' do
        user = create(:user, :with_confirmed_phone)
        expect(user.phone_confirmation).to be_nil
        expect(described_class.new(user, user)).to permit(:request_code_phone)
      end

      it 'does not permit when the user has no phone' do
        user = create(:user)
        expect(described_class.new(user, user)).not_to permit(:request_code_phone)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        user = create(:user, :with_confirmed_phone)
        user.find_or_create_confirmation(:phone_confirmation).update!(code_reset_count: 4)
        expect(described_class.new(user, user)).not_to permit(:request_code_phone)
      end

      it 'does not permit when the sms feature is disabled' do
        SettingsService.new.deactivate_feature!('sms')
        user = create(:user, :with_confirmed_phone)
        expect(described_class.new(user, user)).not_to permit(:request_code_phone)
      end
    end
  end
end
