# frozen_string_literal: true

require 'rails_helper'
require_relative 'shared_examples_for_campaign_delivery_tracking'

RSpec.describe EmailCampaigns::ThresholdReachedForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:assignee) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ThresholdReachedForAdmin.create! }
    let_it_be(:proposal) { create(:proposal, assignee: assignee) }
    let_it_be(:notification) { create(:threshold_reached_for_admin, recipient: recipient, idea: proposal) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          idea_title_multiloc: notification.idea.title_multiloc,
          idea_body_multiloc: notification.idea.body_multiloc,
          idea_published_at: notification.idea.published_at.iso8601,
          idea_author_name: notification.idea.author_name,
          idea_url: Frontend::UrlService.new.model_to_url(notification.idea, locale: Locale.new(recipient.locale)),
          idea_likes_count: notification.idea.likes_count,
          idea_comments_count: notification.idea.comments_count,
          assignee_first_name: notification.idea.assignee.first_name,
          assignee_last_name: notification.idea.assignee.last_name
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('An initiative reached the voting threshold on your platform')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :idea_url))
    end
  end
end
