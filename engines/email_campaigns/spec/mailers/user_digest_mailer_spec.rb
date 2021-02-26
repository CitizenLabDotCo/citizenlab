require 'rails_helper'

RSpec.describe EmailCampaigns::UserDigestMailer, type: :mailer do
  describe 'UserDigest' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::UserDigest.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:command) do {
        recipient: recipient,
        event_payload: {
          notifications_count: 2,
          top_ideas: [],
          discover_projects: [],
          new_initiatives: [],
          successful_initiatives: []
        }
      }
    end

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your activity on')
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

    it 'assigns home url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: 'en'))
    end
  end
end
