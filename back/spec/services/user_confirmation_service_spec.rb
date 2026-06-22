# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  shared_examples 'validation and confirmation' do |method_name, confirmation_assoc|
    let(:confirmation) { user.send(confirmation_assoc) }

    context 'when the code is correct' do
      it 'returns success' do
        result = service.public_send(method_name, user, confirmation.code)
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
        confirmation.update!(code_sent_at: 1.week.ago)
      end

      it 'returns a code expired error' do
        result = service.public_send(method_name, user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :expired }])
      end
    end

    context 'when the code has expired and is invalid' do
      before do
        confirmation.update!(code_sent_at: 1.week.ago)
      end

      it 'returns a code invalid error' do
        result = service.public_send(method_name, user, 'failcode')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end
  end

  describe '#validate_and_confirm_unauthenticated!' do
    let(:user) { create(:unconfirmed_user) }

    before do
      SettingsService.new.activate_feature! 'password_login'
      RequestEmailConfirmationCodeJob.perform_now user
    end

    it 'user should require confirmation' do
      expect(user.confirmation_required?).to be true
    end

    it 'works when the user is already confirmed' do
      user.email_confirmation.confirm!
      expect(user.confirmation_required?).to be false
      RequestEmailConfirmationCodeJob.perform_now(user)
      user.reload.email_confirmation.confirm!
      expect(user.confirmation_required?).to be false
    end

    include_examples 'validation and confirmation', :validate_and_confirm_unauthenticated!, :email_confirmation

    context 'when password_login is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'password_login'
      end

      it 'returns a password login feature disabled error' do
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :password_login_feature_disabled }])
      end
    end

    context 'when the user has a password' do
      let(:user) { create(:unconfirmed_user, password_digest: 'super_secret') }

      it 'returns a user has password error' do
        expect(user.confirmation_required?).to be true
        expect(user.password_digest).not_to be_nil
        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation.code)
        expect(result.success?).to be true
        expect(user.reload.confirmation_required?).to be false
      end
    end

    context 'with pending claim tokens' do
      let!(:claim_token) { create(:claim_token, pending_claimer: user) }
      let(:idea) { claim_token.item }

      it 'completes pending claim tokens on successful confirmation' do
        expect(idea.author_id).to be_nil

        result = service.validate_and_confirm_unauthenticated!(user, user.email_confirmation.code)

        expect(result.success?).to be true
        expect(idea.reload.author_id).to eq(user.id)
        expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#validate_and_confirm_email_change!' do
    let(:user) { create(:user, new_email: 'new@email.com') }

    before do
      RequestNewEmailConfirmationCodeJob.perform_now(user, new_email: user.new_email)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_email_change!, :new_email_confirmation

    context 'when the new email is blank' do
      before do
        user.update(new_email: nil)
      end

      it 'returns a no email error' do
        result = service.validate_and_confirm_email_change!(user, user.new_email_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_email }])
      end
    end
  end

  describe '#validate_and_confirm_phone_change!' do
    let(:user) { create(:user) }
    let(:confirmation) { user.new_phone_confirmation }

    before do
      SettingsService.new.activate_feature!('sms', settings: {
        'twilio_account_sid' => 'AC_test',
        'twilio_auth_token' => 'token',
        'twilio_phone_number' => '+15005550006'
      })
      RequestNewPhoneConfirmationCodeJob.perform_now(user, new_phone_number: '+14155552671')
    end

    context 'when the code is correct' do
      it 'promotes new_phone_number to phone_number and stamps it confirmed' do
        result = service.validate_and_confirm_phone_change!(user, confirmation.code)

        expect(result.success?).to be true
        user.reload
        expect(user.phone_number).to eq('+14155552671')
        expect(user.new_phone_number).to be_nil
        expect(user.phone_number_confirmed_at).to be_present
      end

      it 'does not complete pending claim tokens (an email/signup concern)' do
        expect(ClaimTokenService).not_to receive(:complete)
        service.validate_and_confirm_phone_change!(user, confirmation.code)
      end
    end

    context 'when the user is nil' do
      it 'returns a user blank error' do
        result = service.validate_and_confirm_phone_change!(nil, '1234')

        expect(result.success?).to be false
        expect(result.errors.details).to eq({ user: [{ error: :blank }] })
      end
    end

    context 'when the code is nil' do
      it 'returns a code blank error' do
        result = service.validate_and_confirm_phone_change!(user, nil)

        expect(result.success?).to be false
        expect(result.errors.details).to eq({ code: [{ error: :blank }] })
      end
    end

    context 'when the code is incorrect' do
      it 'returns a code invalid error' do
        result = service.validate_and_confirm_phone_change!(user, 'failcode')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end

    context 'when the code has expired' do
      before { confirmation.update!(code_sent_at: 1.week.ago) }

      it 'returns a code expired error' do
        result = service.validate_and_confirm_phone_change!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :expired }])
      end
    end

    context 'when the new phone number is blank' do
      before { user.update_columns(new_phone_number: nil) }

      it 'returns a no phone error' do
        result = service.validate_and_confirm_phone_change!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_phone }])
      end
    end
  end
end
