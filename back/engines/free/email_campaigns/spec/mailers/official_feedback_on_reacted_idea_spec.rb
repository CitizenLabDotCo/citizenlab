# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::OfficialFeedbackOnReactedIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::OfficialFeedbackOnReactedIdea.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          official_feedback_author_multiloc: { 'en' => 'Citizenlab person' },
          official_feedback_body_multiloc: { 'en' => 'Nice idea, bruh' },
          official_feedback_url: 'https://demo.stg.citizenlab.co',
          post_published_at: Time.zone.today.prev_week.iso8601,
          post_title_multiloc: { 'en' => 'My post is great.' },
          post_author_name: 'Chuck Norris'
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('An idea you reacted to has received an update')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :official_feedback_url))
    end
  end
end
