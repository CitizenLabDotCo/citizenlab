# frozen_string_literal: true

module EmailCampaigns
  class InitiativeMarkedAsSpamMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      initiative = Initiative.first
      initiating_user = User.last
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_created_at: initiative.created_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient_user.locale),
          initiative_reactions_needed: initiative.reactions_needed,
          initiative_expires_at: initiative.expires_at.iso8601,
          spam_report_reason_code: 'other',
          spam_report_other_reason: 'This post is an intrusion to my privacy'
        }
      }
      campaign = EmailCampaigns::Campaigns::InitiativeMarkedAsSpam.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
