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

    it 'changes the confirmation code of a user requiring confirmation' do
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).not_to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued
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
      user.email_confirmation.confirm!
      described_class.perform_now(user.id, 'EmailConfirmation', user.email_confirmation.reload.code)
      expect(user.email_confirmation.reload.code).to be_nil
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

    it 'changes the confirmation code and deletes a user requiring confirmation' do
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).not_to eq(old_code)
      expect(DeleteUserJob).to have_been_enqueued
    end
  end

  context 'confirmed users with no password' do
    let(:user) do
      user = create(:unconfirmed_user)
      user.email_confirmation.confirm!
      user
    end

    it 'does nothing to a user when the user is already confirmed' do
      expect(user.email_confirmation.code).to be_nil
      described_class.perform_now(user.id, 'EmailConfirmation', user.email_confirmation.code)
      expect(user.email_confirmation.reload.code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'expires the code of a user that requires confirmation but has previously completed registration' do
      user.update!(confirmation_required: true)
      RequestEmailConfirmationCodeJob.perform_now(user)
      old_code = user.email_confirmation.code
      described_class.perform_now(user.id, 'EmailConfirmation', old_code)
      expect(user.email_confirmation.reload.code).not_to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued.with(user)
    end
  end
end
