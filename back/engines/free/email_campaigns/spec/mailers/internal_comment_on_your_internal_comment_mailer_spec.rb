# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::InternalCommentOnYourInternalCommentMailer do
  describe 'InternalCommentOnYourInternalCommentMailer' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:post_image) { create(:idea_image) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::InternalCommentOnYourInternalComment.create! }
    let_it_be(:token) { ResetPasswordService.new.generate_reset_password_token recipient }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: 'Matthias',
          initiating_user_last_name: 'Geeke',
          internal_comment_author_name: 'Matthias Geeke',
          internal_comment_body: 'I agree. I really think this input is amazing! Wowzers!',
          internal_comment_url: 'http://localhost:3000/en/internal_comments/fake-url-comment-does-not-exist',
          post_title_multiloc: { en: 'Permit paving of front gardens' },
          post_body_multiloc: {
            en: 'There are many advantages to paving your front garden. Less cars on the road and more space for pedestrians.'
          },
          post_type: 'Idea',
          post_image_medium_url: post_image.image.versions[:medium].url
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'internal_comment_campaign_mailer_examples'
  end
end
