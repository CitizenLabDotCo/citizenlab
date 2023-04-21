# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewInitiativeForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewInitiativeForAdmin.create! }
    let_it_be(:initiative) { create(:initiative, author: recipient) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_published_at: initiative.published_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Someone published a new proposal on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns author name' do
      expect(mail.body.encoded).to match(initiative.author_name)
    end

    it 'assigns go to initiative CTA' do
      initiative_url = Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale)
      expect(mail.body.encoded).to match(initiative_url)
    end
  end
end
