require 'rails_helper'

RSpec.describe EmailCampaigns::AdminRightsReceivedMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::AdminRightsReceived.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


    it 'renders the subject' do
      expect(mail.subject).to start_with('You became an administrator on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the message box title (title_what_can_you_do_administrator)' do
      expect(mail.body.encoded).to match('What can you do as an administrator?')
    end

    it 'assigns moderate CTA' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: 'en'))
    end
  end
end
