require 'rails_helper'

RSpec.describe EmailCampaigns::WelcomeMailer, type: :mailer do
  describe 'Welcome' do
    before do 
      EmailCampaigns::Campaigns::Welcome.create!
      @recipient = create(:user, locale: 'en')
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @recipient.id)
    end

    let(:command) {{
      recipient: @recipient
    }}
    let(:mail) { described_class.campaign_mail(EmailCampaigns::Campaigns::Welcome.first, command).deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Welcome')
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

    it 'assigns @confirmation_url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(tenant: Tenant.current, locale: 'en'))
    end
  end
end