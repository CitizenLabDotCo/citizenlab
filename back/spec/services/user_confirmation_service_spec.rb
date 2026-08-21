# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  shared_examples 'validation and confirmation' do |method_name, confirmation_assoc, confirmed_at_attr|
    let(:confirmation) { user.send(confirmation_assoc) }

    context 'when the code is correct' do
      it 'returns success' do
        result = service.public_send(method_name, user, confirmation.code)
        expect(result.success?).to be true
        expect(user.reload.public_send(confirmed_at_attr)).to be_present
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

    # Codes sent before the 4 -> 6 digit switch must stay usable until they expire.
    context 'when the stored code still has 4 digits' do
      before { confirmation.update!(code: '1234') }

      it 'confirms the user' do
        result = service.public_send(method_name, user, '1234')

        expect(result.success?).to be true
        expect(user.reload.public_send(confirmed_at_attr)).to be_present
      end

      it 'returns a code invalid error and counts the retry on a wrong guess' do
        result = service.public_send(method_name, user, '9999')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
        expect(confirmation.reload.code_retry_count).to eq(1)
      end
    end

    context 'when no confirmation record exists' do
      before do
        user.confirmations.destroy_all
        user.reload
      end

      it 'returns a code invalid error' do
        result = service.public_send(method_name, user, '1234')

        expect(result.success?).to be false
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end
  end

  describe '#validate_and_confirm_email!' do
    let(:user) { create(:unconfirmed_user) }

    before do
      SettingsService.new.activate_feature! 'password_login'
      RequestEmailConfirmationCodeJob.perform_now user
    end

    it 'user should require confirmation' do
      expect(user.confirmation_required?).to be true
    end

    it 'works when the user is already confirmed' do
      user.find_or_create_confirmation(:email_confirmation).confirm!
      expect(user.confirmation_required?).to be false
      RequestEmailConfirmationCodeJob.perform_now(user)
      user.reload.find_or_create_confirmation(:email_confirmation).confirm!
      expect(user.confirmation_required?).to be false
    end

    include_examples 'validation and confirmation', :validate_and_confirm_email!, :email_confirmation, :email_confirmed_at

    context 'when password_login is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'password_login'
      end

      it 'returns a password login feature disabled error' do
        result = service.validate_and_confirm_email!(user, user.email_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :password_login_feature_disabled }])
      end
    end

    context 'when the user has a password' do
      let(:user) { create(:unconfirmed_user, password_digest: 'super_secret') }

      it 'returns a user has password error' do
        expect(user.confirmation_required?).to be true
        expect(user.password_digest).not_to be_nil
        result = service.validate_and_confirm_email!(user, user.email_confirmation.code)
        expect(result.success?).to be true
        expect(user.reload.confirmation_required?).to be false
      end
    end

    context 'with pending claim tokens' do
      let!(:claim_token) { create(:claim_token, pending_claimer: user) }
      let(:idea) { claim_token.item }

      it 'completes pending claim tokens on successful confirmation' do
        expect(idea.author_id).to be_nil

        result = service.validate_and_confirm_email!(user, user.email_confirmation.code)

        expect(result.success?).to be true
        expect(idea.reload.author_id).to eq(user.id)
        expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#validate_and_confirm_new_email!' do
    let(:user) { create(:user, new_email: 'new@email.com') }

    before do
      RequestNewEmailConfirmationCodeJob.perform_now(user, new_email: user.new_email)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_new_email!, :new_email_confirmation, :email_confirmed_at

    context 'when the new email is blank' do
      before do
        user.update(new_email: nil)
      end

      it 'returns a no email error' do
        result = service.validate_and_confirm_new_email!(user, user.new_email_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_email }])
      end
    end
  end

  describe '#validate_and_confirm_phone!' do
    let(:user) { create(:user, phone: '+14155552671') }

    # The code request sends the OTP synchronously, so the provider is invoked.
    include_context 'with stubbed SMS provider'

    before do
      SettingsService.new.activate_feature! 'password_login'
      RequestPhoneConfirmationCodeJob.perform_now(user)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_phone!, :phone_confirmation, :phone_confirmed_at

    context 'when the code is correct' do
      it 'completes pending claim tokens' do
        claim_token = create(:claim_token)
        ClaimTokenService.mark(user, [claim_token.token])
        expect(claim_token.item.author_id).to be_nil

        service.validate_and_confirm_phone!(user, confirmation.code)

        expect(claim_token.item.reload.author_id).to eq user.id
      end
    end

    context 'when password_login is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'password_login'
      end

      it 'returns a password login feature disabled error' do
        result = service.validate_and_confirm_phone!(user, user.phone_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :password_login_feature_disabled }])
      end
    end

    context 'when the sms feature is disabled' do
      before { SettingsService.new.deactivate_feature! 'sms' }

      it 'returns an sms feature disabled error' do
        result = service.validate_and_confirm_phone!(user, user.phone_confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :sms_feature_disabled }])
      end
    end

    context 'when the phone number is blank' do
      before { user.update_columns(phone: nil) }

      it 'returns a no phone error' do
        result = service.validate_and_confirm_phone!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_phone }])
      end
    end
  end

  describe '#validate_and_confirm_new_phone!' do
    let(:user) { create(:user) }
    let(:new_phone) { '+14155552671' }

    # The code request sends the OTP synchronously, so the provider is invoked.
    include_context 'with stubbed SMS provider'

    before do
      user.update!(new_phone: new_phone)
      RequestNewPhoneConfirmationCodeJob.perform_now(user, new_phone: new_phone)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_new_phone!, :new_phone_confirmation, :phone_confirmed_at

    context 'when the code is correct' do
      it 'promotes new_phone to phone and stamps it confirmed' do
        result = service.validate_and_confirm_new_phone!(user, confirmation.code)

        expect(result.success?).to be true
        user.reload
        expect(user.phone).to eq(new_phone)
        expect(user.new_phone).to be_nil
        expect(user.phone_confirmed_at).to be_present
      end

      it 'does not complete pending claim tokens (an email/signup concern)' do
        expect(ClaimTokenService).not_to receive(:complete)
        service.validate_and_confirm_new_phone!(user, confirmation.code)
      end
    end

    context 'when the new phone number is blank' do
      before { user.update_columns(new_phone: nil) }

      it 'returns a no phone error' do
        result = service.validate_and_confirm_new_phone!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_phone }])
      end
    end
  end
end
