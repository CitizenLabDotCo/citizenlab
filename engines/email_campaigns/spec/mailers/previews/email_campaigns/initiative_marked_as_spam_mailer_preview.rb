module EmailCampaigns
  class InitiativeMarkedAsSpamMailerPreview < ActionMailer::Preview
    def campaign_mail
      initiative = Initiative.first
      recipient = User.first
      initiating_user = User.last
      command = {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_created_at: initiative.created_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          initiative_votes_needed: initiative.votes_needed,
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