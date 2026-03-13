# frozen_string_literal: true

require 'rails_helper'

describe AuthenticationService do
  let(:service) { described_class.new }

  describe '.sso_enforced_for_email?' do
    context 'when no enforced domains are configured' do
      it 'returns false' do
        expect(described_class.sso_enforced_for_email?('user@example.com')).to be false
      end
    end

    context 'when azure_ad_login has enforced domains configured' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = { 'allowed' => true, 'enabled' => true, 'enforced_email_domains' => 'example.com,company.org' }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'returns true when the email domain matches' do
        expect(described_class.sso_enforced_for_email?('user@example.com')).to be true
      end

      it 'returns true for another matching domain' do
        expect(described_class.sso_enforced_for_email?('user@company.org')).to be true
      end

      it 'returns false when the email domain does not match' do
        expect(described_class.sso_enforced_for_email?('user@other.com')).to be false
      end

      it 'is case-insensitive' do
        expect(described_class.sso_enforced_for_email?('user@EXAMPLE.COM')).to be true
      end

      it 'returns false for blank email' do
        expect(described_class.sso_enforced_for_email?('')).to be false
      end

      it 'returns false for nil email' do
        expect(described_class.sso_enforced_for_email?(nil)).to be false
      end
    end
  end

  describe '.sso_enforced_error_message_for_email' do
    context 'when no enforced domains are configured' do
      it 'returns nil' do
        expect(described_class.sso_enforced_error_message_for_email('user@example.com')).to be_nil
      end
    end

    context 'when azure_ad_login has enforced domains and error message configured' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = {
          'allowed' => true, 'enabled' => true,
          'enforced_email_domains' => 'example.com',
          'enforced_email_domain_error_message' => 'Please use Azure AD to sign in.'
        }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'returns the error message for a matching domain' do
        expect(described_class.sso_enforced_error_message_for_email('user@example.com')).to eq('Please use Azure AD to sign in.')
      end

      it 'returns nil for a non-matching domain' do
        expect(described_class.sso_enforced_error_message_for_email('user@other.com')).to be_nil
      end
    end

    context 'when azure_ad_login has enforced domains but no error message' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = { 'allowed' => true, 'enabled' => true, 'enforced_email_domains' => 'example.com' }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'returns nil for a matching domain' do
        expect(described_class.sso_enforced_error_message_for_email('user@example.com')).to be_nil
      end
    end
  end

  describe '#prevent_user_account_hijacking' do
    let(:password) { 'supersecret' }

    context 'user confirmation is enabled' do
      before { SettingsService.new.activate_feature! 'user_confirmation' }

      let!(:user) { create(:user, password: password) }

      context 'when the user is not confirmed' do
        before { user.update_columns(confirmation_required: true, email_confirmed_at: nil) }

        it 'removes the user account' do
          user_id = user.id
          expect(service.prevent_user_account_hijacking(user)).to be_nil
          expect(User.exists?(user_id)).to be false
        end
      end

      context 'when the user is confirmed' do
        before { user.reset_confirmation_code! }

        it 'preserves the user account' do
          user_id = user.id
          expect(service.prevent_user_account_hijacking(user)).to eq user
          expect(User.exists?(user_id)).to be true
          expect(user.authenticate(password)).to eq user
        end
      end
    end

    context 'user confirmation is disabled' do
      before { SettingsService.new.deactivate_feature! 'user_confirmation' }

      let!(:user) { create(:user, password: password) }

      it 'clears the password of the user account' do
        user_id = user.id
        expect(service.prevent_user_account_hijacking(user)).to eq user
        expect(User.exists?(user_id)).to be true
        expect(user.authenticate(password)).to be false
      end
    end
  end
end
