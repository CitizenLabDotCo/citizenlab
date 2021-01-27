require 'rails_helper'

RSpec.describe EmailCampaigns::PasswordResetMailer, type: :mailer do
  describe 'PasswordReset' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::PasswordReset.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:token) { ResetPasswordService.new.generate_reset_password_token recipient }
    let(:inviter) { create(:admin) }
    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          password_reset_url: Frontend::UrlService.new.reset_password_url(token, locale: recipient.locale)
        }
      }
    end

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
