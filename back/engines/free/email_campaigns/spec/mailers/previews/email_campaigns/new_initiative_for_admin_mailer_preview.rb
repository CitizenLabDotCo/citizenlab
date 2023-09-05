# frozen_string_literal: true

module EmailCampaigns
  class NewInitiativeForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      initiative = Initiative.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          post_published_at: initiative.published_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient_user.locale),
          initiative_reactions_needed: initiative.reactions_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
      campaign = EmailCampaigns::Campaigns::NewInitiativeForAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
