# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScheduleCodeExpiration do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  context 'when the email confirmation code is correct' do
    before do
      context[:user] = create(:user_with_confirmation)
      context[:user].email_confirmation_code_sent_at = Time.zone.now
      context[:user].save
    end

    it 'enqueues a code expiration job' do
      expect { result }.to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
    end
  end
end
