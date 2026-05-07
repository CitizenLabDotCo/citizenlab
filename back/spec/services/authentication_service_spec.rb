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

    context 'when azure_ad_login has enforced domains' do
      before do
        settings = AppConfiguration.instance.settings
        settings['azure_ad_login'] = {
          'allowed' => true, 'enabled' => true,
          'enforced_email_domains' => 'example.com,company.org'
        }
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

  describe '#prevent_user_account_hijacking' do
    let(:password) { 'supersecret' }

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
      before do
        user.confirm!
      end

      it 'preserves the user account' do
        user_id = user.id
        expect(service.prevent_user_account_hijacking(user)).to eq user
        expect(User.exists?(user_id)).to be true
        expect(user.authenticate(password)).to eq user
      end
    end
  end
end
