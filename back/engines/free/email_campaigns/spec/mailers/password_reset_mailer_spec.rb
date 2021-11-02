# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::PasswordResetMailer, type: :mailer do
  describe 'PasswordReset' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::PasswordReset.create! }
    let_it_be(:token) { ResetPasswordService.new.generate_reset_password_token recipient }
    let_it_be(:inviter) { create(:admin) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          password_reset_url: Frontend::UrlService.new.reset_password_url(token, locale: recipient.locale)
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to end_with('Reset your password')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'assigns reset password url' do
      expect(mail.body.encoded).to include(command[:event_payload][:password_reset_url])
    end
  end
end
