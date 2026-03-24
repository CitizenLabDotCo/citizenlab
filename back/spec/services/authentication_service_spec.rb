# frozen_string_literal: true

require 'rails_helper'

describe AuthenticationService do
  let(:service) { described_class.new }

  describe '.sso_enforced_for_email' do
    context 'when no enforced domains are configured' do
      it 'returns nil' do
        expect(described_class.sso_enforced_for_email('user@example.com')).to be_nil
      end
    end

    context 'when azure_ad_login has enforced domains with a custom error message' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = {
          'allowed' => true, 'enabled' => true,
          'enforced_email_domains' => 'example.com,company.org',
          'enforced_email_domain_error_multiloc' => { 'en' => 'Please use Azure AD to sign in.', 'fr-FR' => 'Veuillez utiliser Azure AD pour vous connecter.' }
        }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'returns the custom multiloc message when the email domain matches' do
        result = described_class.sso_enforced_for_email('user@example.com')
        expect(result).to be_a(Hash)
        expect(result['en']).to eq('Please use Azure AD to sign in.')
        expect(result['fr-FR']).to eq('Veuillez utiliser Azure AD pour vous connecter.')
      end

      it 'returns the custom multiloc message for another matching domain' do
        result = described_class.sso_enforced_for_email('user@company.org')
        expect(result['en']).to eq('Please use Azure AD to sign in.')
      end

      it 'returns nil when the email domain does not match' do
        expect(described_class.sso_enforced_for_email('user@other.com')).to be_nil
      end

      it 'is case-insensitive' do
        result = described_class.sso_enforced_for_email('user@EXAMPLE.COM')
        expect(result['en']).to eq('Please use Azure AD to sign in.')
      end

      it 'returns nil for blank email' do
        expect(described_class.sso_enforced_for_email('')).to be_nil
      end

      it 'returns nil for nil email' do
        expect(described_class.sso_enforced_for_email(nil)).to be_nil
      end
    end

    context 'when azure_ad_login has enforced domains but no custom error message' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = { 'allowed' => true, 'enabled' => true, 'enforced_email_domains' => 'example.com' }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'returns the default I18n multiloc message for a matching domain' do
        result = described_class.sso_enforced_for_email('user@example.com')
        expect(result).to be_a(Hash)
        expect(result['en']).to eq('You must sign in using single sign-on (SSO) for this email domain.')
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
