require 'rails_helper'

RSpec.describe EmailCampaigns::StatusChangeOfYourInitiativeMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::StatusChangeOfYourIdea.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let(:initiative) { create(:initiative) }
    let(:status) { initiative.initiative_status }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_status_id: status.id,
          initiative_status_title_multiloc: status.title_multiloc,
          initiative_status_code: status.code,
          initiative_status_color: status.color
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:mail_document) { Nokogiri::HTML.fragment(mail.body.encoded) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('The status of your proposal has been changed')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(Tenant.current.settings.dig('core', 'organization_name', 'en'))
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(tenant: Tenant.current, locale: 'en'))
    end
  end
end
