# frozen_string_literal: true

require 'rails_helper'

describe AuthenticationService do
  let(:service) { described_class.new }

  describe '#prevent_user_account_hijacking' do
    let(:password) { 'supersecret' }
    let!(:user) { create(:user, password: password) }

    context 'user confirmation is enabled' do
      before { SettingsService.new.activate_feature! 'user_confirmation' }

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

      it 'clears the password of the user account' do
        user_id = user.id
        expect(service.prevent_user_account_hijacking(user)).to eq user
        expect(User.exists?(user_id)).to be true
        expect(user.authenticate(password)).to be false
      end
    end
  end
end
