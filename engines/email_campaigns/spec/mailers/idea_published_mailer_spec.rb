require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaPublishedMailer, type: :mailer do
  describe 'Idea published' do
    before do
      EmailCampaigns::Campaigns::IdeaPublished.create!
      @recipient = create(:user, locale: 'en')
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @recipient.id)

      @idea = create(:idea, author: @recipient)
    end

    let(:command) do
      {
        recipient: @recipient,
        event_payload: {
          post_id: @idea.id,
          post_title_multiloc: @idea.title_multiloc,
          post_body_multiloc: @idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(@idea, locale: @recipient.locale),
          post_images: @idea.idea_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map { |k, v| [k.to_s, v.url] }.to_h
            }
          end
        }
      }
    end
    let(:mail) { described_class.campaign_mail(EmailCampaigns::Campaigns::IdeaPublished.first, command).deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your idea on the platform of')
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

    it 'assigns go to idea CTA' do
      idea_url = Frontend::UrlService.new.model_to_url(@idea, locale: @recipient.locale)
      expect(mail.body.encoded).to match(idea_url)
    end
  end
end
