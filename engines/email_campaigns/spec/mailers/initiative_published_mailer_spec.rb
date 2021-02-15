require 'rails_helper'

RSpec.describe EmailCampaigns::InitiativePublishedMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::InitiativePublished.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    
    let!(:initiative) { create(:initiative, author: recipient) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map { |k, v| [k.to_s, v.url] }.to_h
            }
          end,
          initiative_header_bg: {
            versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


    it 'renders the subject' do
      expect(mail.subject).to start_with('Your proposal was published on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns go to initiative CTA' do
      initiative_url = Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale)
      expect(mail.body.encoded).to match(initiative_url)
    end
  end
end
