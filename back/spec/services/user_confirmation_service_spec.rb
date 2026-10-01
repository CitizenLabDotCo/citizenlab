# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  # activity_payload_key is :new_email or :new_phone; pending_attr is the attribute
  # holding the value being confirmed, for the flows that change an existing one.
  shared_examples 'validation and confirmation' do |method_name, confirmation_assoc, confirmed_at_attr, activity_payload_key, pending_attr = nil|
    let(:confirmation) { user.send(confirmation_assoc) }

    context 'when the code is correct' do
      it 'returns success' do
        result = service.public_send(method_name, user, confirmation.code)
        expect(result.success?).to be true
        expect(user.reload.public_send(confirmed_at_attr)).to be_present
      end

      it 'enqueues a "confirmed_confirmation_code" activity job' do
        payload = { activity_payload_key => pending_attr && user.public_send(pending_attr) }

        expect { service.public_send(method_name, user, confirmation.code) }
          .to enqueue_job(LogActivityJob)
          .with(user, 'confirmed_confirmation_code', user, anything, payload: payload)
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

      it 'does not enqueue a "confirmed_confirmation_code" activity job' do
        expect { service.public_send(method_name, user, 'failcode') }
          .not_to enqueue_job(LogActivityJob).with(anything, 'confirmed_confirmation_code', any_args)
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

    context 'when the code has been expired' do
      before { confirmation.expire_code! }

      [nil, ''].each do |submitted_code|
        it "rejects #{submitted_code.inspect} without counting a retry" do
          result = nil
          expect { result = service.public_send(method_name, user, submitted_code) }
            .not_to change { user.reload.public_send(confirmed_at_attr) }

          expect(result.success?).to be false
          expect(result.errors.details).to eq(code: [{ error: :expired }])
          expect(confirmation.reload.code_retry_count).to eq(0)
        end
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

    include_examples 'validation and confirmation', :validate_and_confirm_email!, :email_confirmation, :email_confirmed_at, :new_email

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

  describe '#validate_and_reconfirm_email!' do
    let(:user) { create(:user, email_confirmed_at: 1.year.ago) }

    before do
      RequestEmailConfirmationCodeJob.perform_now user
      user.reload
    end

    include_examples 'validation and confirmation', :validate_and_reconfirm_email!, :email_confirmation, :email_confirmed_at, :new_email

    context 'when the code is correct' do
      it 'refreshes email_confirmed_at' do
        old_confirmed_at = user.email_confirmed_at

        result = service.validate_and_reconfirm_email!(user, confirmation.code)

        expect(result.success?).to be true
        expect(user.reload.email_confirmed_at).to be > old_confirmed_at
      end
    end

    # Unlike validate_and_confirm_email!: an account created through SSO must
    # still be able to re-confirm.
    context 'when password_login is disabled' do
      before { SettingsService.new.deactivate_feature! 'password_login' }

      it 'still confirms the user' do
        result = service.validate_and_reconfirm_email!(user, confirmation.code)

        expect(result.success?).to be true
      end
    end

    context 'when the email is blank' do
      before { user.update_columns(email: nil) }

      it 'returns a no email error' do
        result = service.validate_and_reconfirm_email!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(user: [{ error: :no_email }])
      end
    end
  end

  describe '#validate_and_confirm_new_email!' do
    let(:user) { create(:user, new_email: 'new@email.com') }

    before do
      RequestNewEmailConfirmationCodeJob.perform_now(user, new_email: user.new_email)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_new_email!, :new_email_confirmation, :email_confirmed_at, :new_email, :new_email

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

  describe '#validate_and_confirm_merge_account!' do
    # An email-less SSO account that asked to be merged into whoever owns the address.
    let(:user) do
      create(:user).tap do |u|
        u.update_columns(email: nil, password_digest: nil)
        create(:identity, user: u, provider: 'clave_unica', uid: '11111')
      end
    end

    let(:result) do
      RequestMergeAccountConfirmationCodeJob.perform_now(user, merge_target_email: 'existing@example.org')
      service.validate_and_confirm_merge_account!(user, user.merge_account_confirmation.code)
    end

    it 'merges into the account owning the address' do
      target = create(:user, email: 'existing@example.org')

      expect(result.success?).to be true
      expect(result.user).to eq target
      expect { user.reload }.to raise_error ActiveRecord::RecordNotFound
    end

    # The merged-away user is deleted, so the activity goes to the survivor.
    it 'enqueues a "confirmed_confirmation_code" activity job for the account merged into' do
      target = create(:user, email: 'existing@example.org')

      expect { result }.to enqueue_job(LogActivityJob).with(target, 'confirmed_confirmation_code', target, anything)
    end

    context 'when the code is incorrect' do
      before { RequestMergeAccountConfirmationCodeJob.perform_now(user, merge_target_email: 'existing@example.org') }

      it 'returns a code invalid error without enqueueing a "confirmed_confirmation_code" activity job' do
        create(:user, email: 'existing@example.org')
        result = nil

        expect { result = service.validate_and_confirm_merge_account!(user, 'failcode') }
          .not_to enqueue_job(LogActivityJob).with(anything, 'confirmed_confirmation_code', any_args)
        expect(result.errors.details).to eq(code: [{ error: :invalid }])
      end
    end

    context 'when the code has been expired' do
      before do
        RequestMergeAccountConfirmationCodeJob.perform_now(user, merge_target_email: 'existing@example.org')
        create(:user, email: 'existing@example.org')
        user.merge_account_confirmation.expire_code!
      end

      [nil, ''].each do |submitted_code|
        it "rejects #{submitted_code.inspect} without counting a retry or merging" do
          result = service.validate_and_confirm_merge_account!(user, submitted_code)

          expect(result.success?).to be false
          expect(result.errors.details).to eq(code: [{ error: :expired }])
          expect(user.reload.merge_account_confirmation.code_retry_count).to eq(0)
        end
      end
    end

    # The code still proved the user reads that inbox.
    context 'when nobody owns the address any more' do
      it "makes it the user's own confirmed email instead of merging" do
        expect(result.success?).to be true
        expect(result.user).to eq user

        user.reload
        expect(user.email).to eq 'existing@example.org'
        expect(user.merge_target_email).to be_nil
        expect(user.email_confirmed_at).to be_present
        expect(user.confirmation_required).to be false
        expect(MergeAccountConfirmation.count).to eq 0
      end

      it 'enqueues a "confirmed_confirmation_code" activity job for the user' do
        expect { result }.to enqueue_job(LogActivityJob).with(user, 'confirmed_confirmation_code', user, anything)
      end
    end
  end

  describe '#validate_and_confirm_phone!' do
    let(:user) { create(:user, phone: '+14155552671') }

    # The code request sends the OTP synchronously, so the provider is invoked.
    include_context 'with stubbed SMS provider'

    before do
      SettingsService.new.activate_feature! 'password_login'
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      RequestPhoneConfirmationCodeJob.perform_now(user)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_phone!, :phone_confirmation, :phone_confirmed_at, :new_phone

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

  describe '#validate_and_reconfirm_phone!' do
    let(:user) { create(:user, phone: '+14155552671', phone_confirmed_at: 1.year.ago) }

    # The code request sends the OTP synchronously, so the provider is invoked.
    include_context 'with stubbed SMS provider'

    before do
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      RequestPhoneConfirmationCodeJob.perform_now(user)
      user.reload
    end

    include_examples 'validation and confirmation', :validate_and_reconfirm_phone!, :phone_confirmation, :phone_confirmed_at, :new_phone

    context 'when the code is correct' do
      it 'refreshes phone_confirmed_at' do
        old_confirmed_at = user.phone_confirmed_at

        result = service.validate_and_reconfirm_phone!(user, confirmation.code)

        expect(result.success?).to be true
        expect(user.reload.phone_confirmed_at).to be > old_confirmed_at
      end
    end

    # Unlike validate_and_confirm_phone!, which is a login path.
    context 'when password_login is disabled' do
      before { SettingsService.new.deactivate_feature! 'password_login' }

      it 'still confirms the user' do
        result = service.validate_and_reconfirm_phone!(user, confirmation.code)

        expect(result.success?).to be true
      end
    end

    # The sms feature carries the settings the code is sent through.
    context 'when the sms feature is disabled' do
      before { SettingsService.new.deactivate_feature! 'sms' }

      it 'returns an sms feature disabled error' do
        result = service.validate_and_reconfirm_phone!(user, confirmation.code)

        expect(result.success?).to be false
        expect(result.errors.details).to eq(base: [{ error: :sms_feature_disabled }])
      end
    end

    context 'when the phone number is blank' do
      before { user.update_columns(phone: nil) }

      it 'returns a no phone error' do
        result = service.validate_and_reconfirm_phone!(user, confirmation.code)

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
      RequestNewPhoneConfirmationCodeJob.issue_code!(user, new_phone: new_phone)
      RequestNewPhoneConfirmationCodeJob.perform_now(user, new_phone: new_phone)
    end

    include_examples 'validation and confirmation', :validate_and_confirm_new_phone!, :new_phone_confirmation, :phone_confirmed_at, :new_phone, :new_phone

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
