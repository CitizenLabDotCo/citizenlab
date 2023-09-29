# frozen_string_literal: true

module EmailCampaigns
  class InitiativeAssignedToYouMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      initiative = Initiative.order(created_at: :asc).first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient_user).display_name!(initiative.author),
          post_published_at: initiative.published_at&.iso8601,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient_user.locale),
          post_assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
          initiative_reactions_needed: initiative.reactions_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
      campaign = EmailCampaigns::Campaigns::InitiativeAssignedToYou.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
