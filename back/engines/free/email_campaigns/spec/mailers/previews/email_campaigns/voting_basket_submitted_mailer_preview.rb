# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      ideas = project.ideas.first(3)
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient_user.locale)),
          voted_ideas: EmailCampaigns::PayloadFormatterService.new.format_ideas_list(ideas, recipient_user)
        }
      }
      campaign = EmailCampaigns::Campaigns::VotingBasketSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
