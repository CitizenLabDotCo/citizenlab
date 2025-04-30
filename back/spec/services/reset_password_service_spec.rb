# frozen_string_literal: true

require 'rails_helper'

describe ResetPasswordService do
  subject(:service) { described_class.new }

  describe '#generate_reset_password_token' do
    let(:user) { build(:user) }

    it 'returns a token string' do
      expect(service.generate_reset_password_token(user)).to be_a(String)
    end
  end

  describe '#send_email_later' do
    let(:user) { create(:user) }
    let(:token) { 'token' }

    it 'schedules a ResetPasswordMailer job' do
      expect { service.send_email_later(user, token) }.to have_enqueued_mail(ResetPasswordMailer, :send_reset_password)
    end
  end

  describe '#token_valid?' do
    let(:user) { create(:user) }
    let(:valid_token) { service.generate_reset_password_token(user) }
    let(:invalid_token) { 'an_invalid_token_example' }

    it 'returns true if the token matches' do
      expect(service.token_valid?(user, valid_token)).to be(true)
    end

    it 'return false if the token does not match' do
      expect(service.token_valid?(user, invalid_token)).to be(false)
    end
  end

  describe '#log_activity' do
    let(:user) { create(:user) }
    let(:token) { 'token' }

    it 'schedules a LogActivityJob' do
      expect { service.log_activity(user, token) }
        .to have_enqueued_job(LogActivityJob).with(
          user,
          'requested_password_reset',
          user,
          anything,
          payload: { token: token }
        )
    end
  end
end
