# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::PasswordResetMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }

    let(:url) { 'https://demo.stg.govocal.com/en/reset-password?token=abc123' }
    let(:campaign) { create(:password_reset_campaign) }
    let(:command) { { recipient: recipient, event_payload: { password_reset_url: url } } }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to end_with('Reset your password')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'assigns the organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes the reset password url in the CTA' do
      expect(mail.body.encoded).to include(url)
    end
  end
end
