# frozen_string_literal: true

module EmailCampaigns
  class InitiativePublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      initiative = Initiative.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient_user.locale),
          post_images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          initiative_header_bg: {
            versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
          },
          initiative_reactions_needed: initiative.reactions_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
      campaign = EmailCampaigns::Campaigns::InitiativePublished.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
