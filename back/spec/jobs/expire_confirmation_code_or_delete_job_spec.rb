# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpireConfirmationCodeOrDeleteJob do
  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    ActiveJob::Base.queue_adapter.enqueued_jobs.clear
  end

  context 'full users' do
    let(:user) { create(:user_with_confirmation) }

    it 'changes the confirmation code of a user requiring confirmation' do
      old_code = user.email_confirmation_code
      described_class.perform_now(user.id, user.email_confirmation_code)
      expect(user.reload.email_confirmation_code).not_to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when the code to expire is not the current code' do
      old_code = user.email_confirmation_code
      another_code = '12345'
      described_class.perform_now(user.id, another_code)
      expect(user.reload.email_confirmation_code).to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when the user does not require confirmation' do
      user.email_confirmation_code
      user.confirm!
      described_class.perform_now(user.id, user.email_confirmation_code)
      expect(user.reload.email_confirmation_code).to be_nil
      expect(DeleteUserJob).not_to have_been_enqueued
    end

    it 'does nothing when user record does not exist' do
      non_existent_user_id = '1a1a1a1a-2b2b-3c3c3c-4d4d-5e5e5e5e'
      described_class.perform_now(non_existent_user_id, '1234')
      expect(DeleteUserJob).not_to have_been_enqueued
    end
  end

  context 'users with no password' do
    let(:user_no_password) { create(:user_no_password) }

    it 'resets code and queues a user deletion job if user has not completed registration' do
      old_code = user_no_password.email_confirmation_code
      described_class.perform_now(user_no_password.id, user_no_password.email_confirmation_code)
      expect(user_no_password.reload.email_confirmation_code).not_to eq(old_code)
      expect(DeleteUserJob).to have_been_enqueued.with(user_no_password)
    end

    it 'only expires the code of a user that requires confirmation but has previously completed registration' do
      user_no_password.update(registration_completed_at: Time.now)
      old_code = user_no_password.email_confirmation_code
      described_class.perform_now(user_no_password.id, user_no_password.email_confirmation_code)
      expect(user_no_password.reload.email_confirmation_code).not_to eq(old_code)
      expect(DeleteUserJob).not_to have_been_enqueued.with(user_no_password)
    end
  end
end
