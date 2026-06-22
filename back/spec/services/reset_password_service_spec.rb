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

  describe '#send_email' do
    let(:user) { create(:user, locale: 'en') }
    let(:token) { 'sometoken' }

    it 'delivers the password reset email synchronously' do
      expect { service.send_email(user, token) }.to change { ActionMailer::Base.deliveries.count }.by(1)
      mail = ActionMailer::Base.deliveries.last
      expect(mail.to).to eq([user.email])
      expect(mail.body.encoded).to include(token)
    end

    it 'records a delivery for the PasswordReset campaign' do
      expect { service.send_email(user, token) }.to change(EmailCampaigns::Delivery, :count).by(1)
      expect(EmailCampaigns::Delivery.order(:created_at).last.campaign).to be_a(EmailCampaigns::Campaigns::PasswordReset)
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

    it 'schedules a LogAcitvityJob' do
      expect { service.log_activity(user, token) }.to have_enqueued_job(LogActivityJob)
    end
  end
end
