# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewIdeaForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewIdeaForAdmin.create! }
    let_it_be(:idea) { create(:idea, author: recipient) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_published_at: idea.published_at.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale)
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('A new post has been published on')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns author name' do
      expect(mail.body.encoded).to match(idea.author_name)
    end

    it 'assigns go to idea CTA' do
      idea_url = Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale)
      expect(mail.body.encoded).to match(idea_url)
    end
  end
end
