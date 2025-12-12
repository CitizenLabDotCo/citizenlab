# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    RequestConfirmationCodeJob.perform_now user
  end

  shared_examples 'validation and confirmation' do |method_name|
    context 'when the user is nil' do
      it 'returns a user blank error' do
        result = service.public_send(method_name, nil, '1234')

        expect(result.success?).to be false
        expect(result.errors.details).to eq({ user: [{ error: :blank }] })
      end
    end

    context 'when the code is nil' do
      it 'returns a code blank error' do
        result = service.public_send(method_name, user, nil)

        expect(result.success?).to be false
        expect(result.errors.details).to eq({ code: [{ error: :blank }] })
      end
    end

    context 'when the code is incorrect' do
      it 'returns a code invalid error' do
        result = service.public_send(method_name, user, 'failcode')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end

    context 'when the code has expired' do
      before do
        user.update(email_confirmation_code_sent_at: 1.week.ago)
      end

      it 'returns a code expired error' do
        result = service.public_send(method_name, user, user.email_confirmation_code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :expired }])
      end
    end

    context 'when the code has expired and is invalid' do
      before do
        user.update(email_confirmation_code_sent_at: 1.week.ago)
      end

      it 'returns a code invalid error' do
        result = service.public_send(method_name, user, 'failcode')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end
  end

  describe '#validate_and_confirm_unauthenticated!' do
    before do
      SettingsService.new.activate_feature! 'password_login'
    end

    let(:user) { create(:user_no_password) }

    include_examples 'validation and confirmation', :validate_and_confirm_unauthenticated!

    context 'when password_login is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'password_login'
      end

      it 'returns a password login feature disabled error' do
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation_code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :password_login_feature_disabled }])
      end
    end

    context 'when the user has a password' do
      let(:user) { create(:user) }

      it 'returns a user has password error' do
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation_code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :has_password }])
      end
    end
  end

  describe '#validate_and_confirm_authenticated!' do
    let(:user) { create(:user_with_confirmation) }

    include_examples 'validation and confirmation', :validate_and_confirm_authenticated!
  end

  describe '#validate_and_confirm_email_change!' do
    let(:user) { create(:user, new_email: 'new@email.com') }

    include_examples 'validation and confirmation', :validate_and_confirm_email_change!
  end
end
 