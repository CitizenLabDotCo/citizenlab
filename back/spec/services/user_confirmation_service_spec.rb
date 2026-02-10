# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    RequestConfirmationCodeJob.perform_now user
  end

  shared_examples 'validation and confirmation' do |method_name|
    context 'when the code is correct' do
      it 'returns success' do
        expect(user.confirmation_required?).to be true
        result = service.public_send(method_name, user, user.email_confirmation_code)
        expect(result.success?).to be true
        expect(user.reload.confirmation_required?).to be false
      end
    end

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
      let(:user) { create(:user_with_confirmation) }

      it 'returns a user has password error' do
        expect(user.confirmation_required?).to be true
        expect(user.password_digest).not_to be_nil
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation_code)
        expect(result.success?).to be true
        expect(user.reload.confirmation_required?).to be false
      end
    end

    context 'when account already has a new_email' do
      let(:user) { create(:user_no_password, new_email: 'some@email.com') }

      it 'returns a user has new email error' do
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation_code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :has_new_email }])
      end
    end

    context 'with pending claim tokens' do
      let!(:claim_token) { create(:claim_token, pending_claimer: user) }
      let(:idea) { claim_token.item }

      it 'completes pending claim tokens on successful confirmation' do
        expect(idea.author_id).to be_nil

        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation_code)

        expect(result.success?).to be true
        expect(idea.reload.author_id).to eq(user.id)
        expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#validate_and_confirm_email_change!' do
    let(:user) { create(:user, new_email: 'new@email.com') }

    include_examples 'validation and confirmation', :validate_and_confirm_email_change!

    context 'when the new email is blank' do
      before do
        user.update(new_email: nil)
      end

      it 'returns a no email error' do
        result = service.validate_and_confirm_email_change!(user, user.email_confirmation_code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_email }])
      end
    end
  end
end
