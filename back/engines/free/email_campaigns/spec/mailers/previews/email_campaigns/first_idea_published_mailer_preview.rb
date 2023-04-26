# frozen_string_literal: true

module EmailCampaigns
  class FirstIdeaPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      idea = Idea.first
      command = {
        recipient: recipient_user,
        event_payload: {
          post_id: idea.id,
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient_user.locale),
          post_images: idea.idea_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end
        }
      }
      campaign = EmailCampaigns::Campaigns::FirstIdeaPublished.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
