# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewCommentOnReactedIdeaMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewCommentOnReactedIdea.create! }
    let_it_be(:command) do
      idea = create(:idea)
      comment = create(:comment, post: idea)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: name_service.last_name!(comment.author),
          post_published_at: comment.post.published_at.iso8601,
          post_title_multiloc: comment.post.title_multiloc,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale)
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('There\'s a new comment on the idea you\'ve reacted to')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: 'en'))
    end
  end
end
