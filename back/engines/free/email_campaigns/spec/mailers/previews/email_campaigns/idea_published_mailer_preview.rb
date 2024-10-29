# frozen_string_literal: true

module EmailCampaigns
  class IdeaPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      idea = Idea.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          post_id: idea.id,
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient_user.locale)),
          post_images: idea.idea_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          input_term: idea.input_term
        }
      }
      campaign = EmailCampaigns::Campaigns::IdeaPublished.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
