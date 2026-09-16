# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpireConfirmationCodeOrDeleteJob do
  before do
    ActiveJob::Base.queue_adapter.enqueued_jobs.clear
  end

  context 'full users who reset confirmation code' do
    let(:user) do
      user = create(:user)
      user.update!(confirmation_required: true)
      RequestEmailConfirmationCodeJob.perform_now(user)
      user
    end

    it 'clears the confirmation code of a user requiring confirmation' do
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'keeps the row and its counters' do
      user.email_confirmation.update!(code_retry_count: 2, code_reset_count: 3)
      described_class.perform_now(user.id, 'EmailConfirmation', user.email_confirmation.code)
      expect(user.email_confirmation.reload).to have_attributes(code: nil, code_retry_count: 2, code_reset_count: 3)
    end

    it 'does nothing when the code to expire is not the current code' do
      RequestEmailConfirmationCodeJob.perform_now(user)
      old_code = user.email_confirmation.reload.code
      another_code = '12345'
      described_class.perform_now(user.id, 'EmailConfirmation', another_code)
      expect(user.email_confirmation.reload.code).to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when the user does not require confirmation' do
      code = user.email_confirmation.code
      user.email_confirmation.confirm!
      described_class.perform_now(user.id, 'EmailConfirmation', code)
      expect(user.reload.email_confirmation).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when user record does not exist' do
      non_existent_user_id = '1a1a1a1a-2b2b-3c3c3c-4d4d-5e5e5e5e'
      described_class.perform_now(non_existent_user_id, 'EmailConfirmation', '1234')
      expect(DeleteUserJob).not_to have_been_enqueued
    end
  end

  context 'unconfirmed users' do
    let(:user) do
      user = create(:unconfirmed_user)
      RequestEmailConfirmationCodeJob.perform_now(user)
      user
    end

    # The job loads the confirmation before taking the lock; these simulate a
    # concurrent request committing in between.
    context 'when the confirmation changes after the job loaded it' do
      let(:old_code) { user.email_confirmation.code }

      before do
        old_code
        allow(User).to receive(:find_by).with(id: user.id).and_return(user)
      end

      it 'does not clear a code that was reissued in the meantime' do
        Confirmation.find(user.email_confirmation.id).update_columns(code: '654321')

        described_class.perform_now(user.id, 'EmailConfirmation', old_code)

        expect(user.email_confirmation.reload.code).to eq('654321')
        expect(DeleteUserJob).not_to have_been_enqueued
      end

      it 'does nothing when the confirmation was consumed in the meantime' do
        Confirmation.where(id: user.email_confirmation.id).delete_all

        expect { described_class.perform_now(user.id, 'EmailConfirmation', old_code) }.not_to raise_error
        expect(DeleteUserJob).not_to have_been_enqueued
      end
    end

    it 'clears the confirmation code and deletes a user requiring confirmation' do
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).to have_been_enqueued
    end
  end

  # The phone signup flow (POST /users/phone) is the mirror of the email one:
  # a user who never confirms the number they signed up with is garbage-collected.
  context 'unconfirmed phone users' do
    let(:user) do
      user = create(:unconfirmed_phone_user)
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      user
    end

    it 'clears the confirmation code and deletes a user requiring confirmation' do
      old_code = user.phone_confirmation.code
      described_class.perform_now(user.id, 'PhoneConfirmation', old_code)
      expect(user.phone_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).to have_been_enqueued
    end

    it 'does nothing when the code to expire is not the current code' do
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      old_code = user.phone_confirmation.reload.code
      described_class.perform_now(user.id, 'PhoneConfirmation', '12345')
      expect(user.phone_confirmation.reload.code).to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when the user has already confirmed their phone number' do
      code = user.phone_confirmation.code
      user.phone_confirmation.confirm!
      described_class.perform_now(user.id, 'PhoneConfirmation', code)
      expect(user.reload.phone_confirmation).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end
  end

  context 'full users with an unconfirmed phone number' do
    let(:user) do
      user = create(:user, phone: '+14155552671')
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      user
    end

    it 'expires the code but keeps a user who has a password and completed registration' do
      old_code = user.phone_confirmation.code
      described_class.perform_now(user.id, 'PhoneConfirmation', old_code)
      expect(user.phone_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end
  end

  # Changing the number on an existing account must never delete that account,
  # however incomplete the account itself is.
  context 'users with a pending new phone number' do
    let(:user) do
      user = create(:unconfirmed_phone_user)
      RequestNewPhoneConfirmationCodeJob.issue_code!(user, new_phone: '+14155552671')
      user
    end

    it 'expires the code without deleting the user' do
      old_code = user.new_phone_confirmation.code
      described_class.perform_now(user.id, 'NewPhoneConfirmation', old_code)
      expect(user.new_phone_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end
  end

  context 'confirmed users with no password' do
    let(:user) do
      user = create(:unconfirmed_user)
      user.find_or_create_confirmation(:email_confirmation).confirm!
      user
    end

    it 'does nothing to a user when the user is already confirmed' do
      expect(user.reload.email_confirmation).to be_nil
      described_class.perform_now(user.id, 'EmailConfirmation', '123456')
      expect(user.reload.email_confirmation).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'expires the code of a user that requires confirmation but has previously completed registration' do
      user.update!(confirmation_required: true)
      RequestEmailConfirmationCodeJob.perform_now(user)
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued.with(user)
    end
  end
end
