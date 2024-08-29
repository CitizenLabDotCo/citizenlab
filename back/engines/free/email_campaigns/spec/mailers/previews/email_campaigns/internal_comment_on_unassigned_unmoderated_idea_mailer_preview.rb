# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnUnassignedUnmoderatedIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          initiating_user_first_name: 'Matthias',
          initiating_user_last_name: 'Geeke',
          internal_comment_author_name: 'Matthias Geeke',
          internal_comment_body: 'I think this input is amazing!',
          internal_comment_url: 'http://localhost:3000/en/internal_comments/fake-url-comment-does-not-exist',
          post_title_multiloc: { en: 'Permit paving of front gardens' },
          post_body_multiloc: {
            en: 'There are many advantages to paving your front garden. Less cars on the road and more space for pedestrians.'
          },
          post_type: 'Idea',
          post_image_medium_url: IdeaImage.first.image.versions[:medium].url
        }
      }

      campaign = EmailCampaigns::Campaigns::InternalCommentOnUnassignedUnmoderatedIdea.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
