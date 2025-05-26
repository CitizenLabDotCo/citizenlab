# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::InternalCommentOnUnassignedUnmoderatedIdeaMailer do
  describe 'InternalCommentOnUnassignedUnmoderatedIdeaMailer' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:idea_image) { create(:idea_image) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::InternalCommentOnUnassignedUnmoderatedIdea.create! }
    let_it_be(:token) { ResetPasswordService.new.generate_reset_password_token recipient }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: 'Matthias',
          initiating_user_last_name: 'Geeke',
          internal_comment_author_name: 'Matthias Geeke',
          internal_comment_body: 'I think this input is amazing! Wowzers!',
          internal_comment_url: 'http://localhost:3000/en/internal_comments/fake-url-comment-does-not-exist',
          idea_title_multiloc: { en: 'Permit paving of front gardens' },
          idea_body_multiloc: {
            en: 'There are many advantages to paving your front garden. Less cars on the road and more space for pedestrians.'
          },
          idea_type: 'Idea',
          idea_image_medium_url: idea_image.image.versions[:medium].url
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'internal_comment_campaign_mailer_examples'
  end
end
