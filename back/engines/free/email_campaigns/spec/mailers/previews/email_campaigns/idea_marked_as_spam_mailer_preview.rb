# frozen_string_literal: true

module EmailCampaigns
  class IdeaMarkedAsSpamMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      idea = Idea.first
      initiating_user = User.last
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          idea_created_at: idea.created_at.iso8601,
          idea_title_multiloc: idea.title_multiloc,
          idea_author_name: idea.author_name,
          idea_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient_user.locale)),
          spam_report_reason_code: 'wrong_content',
          spam_report_other_reason: nil
        }
      }
      campaign = EmailCampaigns::Campaigns::IdeaMarkedAsSpam.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
