# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaAssignment::EmailCampaigns::IdeaAssignedToYouMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou.create! }
    let_it_be(:assigned_at) { Time.zone.now }
    let_it_be(:idea) { create(:idea, author: recipient, assignee: create(:admin), assigned_at: assigned_at) }
    let_it_be(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(idea.author) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_author_name: author_name,
          post_published_at: idea.published_at&.iso8601,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          post_assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601)
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('You have an assignment on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns idea author name' do
      expect(mail.body.encoded).to match(author_name)
    end

    it 'assigns go to idea CTA' do
      admin_ideas_url = Frontend::UrlService.new.admin_ideas_url
      expect(mail.body.encoded).to match(admin_ideas_url)
    end
  end
end
