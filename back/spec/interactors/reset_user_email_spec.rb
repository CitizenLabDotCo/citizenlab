# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ResetUserEmail do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  context 'when user confirmation is turned on' do
    before do
      SettingsService.new.activate_feature! 'user_confirmation'
    end

    context 'when passing a new email' do
      before do
        context[:user] = create(:user_with_confirmation)
        context[:new_email] = 'new@email.com'
      end

      it 'sets the user email temporarily in new email' do
        expect { result }.to change(context[:user], :new_email).from(nil).to(context[:new_email])
      end
    end

    context 'when not passing a new email' do
      before do
        context[:user] = create(:user_with_confirmation)
      end

      it 'is a success' do
        expect(result).to be_a_success
      end

      it 'does not set a new email' do
        expect { result }.not_to change(context[:user], :new_email)
      end
    end

    context 'when passing an invalid new email' do
      before do
        context[:user] = create(:user_with_confirmation)
        context[:new_email] = 'new@email-com'
      end

      it 'does not change the user email' do
        expect(context[:user].reload.email).not_to eq(context[:new_email])
      end

      it 'returns email errors' do
        expect(result.errors[:email]).not_to be_empty
      end
    end

    context 'when passing an email that already exists' do
      before do
        create(:user, email: 'new@email.com')
        context[:user] = create(:user_with_confirmation)
        context[:new_email] = 'new@email.com'
      end

      it 'does not change the user email' do
        expect(context[:user].reload.email).not_to eq(context[:new_email])
      end

      it 'returns email errors' do
        expect(result.errors[:email]).not_to be_empty
      end
    end

    context 'when a user is passwordless and not active' do
      before do
        context[:user] = create(:user_no_password)
        context[:new_email] = 'new@email.com'
      end

      # TODO: Failing
      it 'returns email errors' do
        expect(result.errors[:email]).not_to be_empty
      end
    end
  end

  context 'when user confirmation is not turned on' do
    context 'when passing a new email' do
      before do
        context[:user] = create(:user_with_confirmation)
        context[:new_email] = 'new@email.com'
      end

      it 'sets the user email straight to the email column' do
        expect { result }.to change(context[:user], :email).from(context[:user].email).to(context[:new_email])
      end
    end
  end
end
