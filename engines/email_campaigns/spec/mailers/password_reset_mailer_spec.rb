require 'rails_helper'

RSpec.describe EmailCampaigns::PasswordResetMailer, type: :mailer do
  describe 'PasswordReset' do
    before do 
      EmailCampaigns::Campaigns::PasswordReset.create!
      @recipient = create(:user, locale: 'en')
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @recipient.id)
    end

    let(:token) { ResetPasswordService.new.generate_reset_password_token @recipient }
    let(:inviter) { create(:admin) }
    let(:command) {{
      recipient: @recipient,
      event_payload: {
        password_reset_url: Frontend::UrlService.new.reset_password_url(token, locale: @recipient.locale)
      }
    }}
    let(:mail) { described_class.campaign_mail(EmailCampaigns::Campaigns::PasswordReset.first, command).deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to end_with('Reset your password')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([@recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(Tenant.current.settings.dig('core', 'organization_name')['en'])
    end

    it 'assigns reset password url' do
      expect(mail.body.encoded)
        .to include(command[:event_payload][:password_reset_url])
    end
  end
end