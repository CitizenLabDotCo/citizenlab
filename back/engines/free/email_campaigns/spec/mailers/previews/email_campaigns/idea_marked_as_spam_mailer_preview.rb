module EmailCampaigns
  class IdeaMarkedAsSpamMailerPreview < ActionMailer::Preview
    def campaign_mail
      idea = Idea.first
      recipient = User.first
      initiating_user = User.last
      command = {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_created_at: idea.created_at.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          spam_report_reason_code: 'wrong_content',
          spam_report_other_reason: nil
        }
      }
      campaign = EmailCampaigns::Campaigns::IdeaMarkedAsSpam.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end