# frozen_string_literal: true

module EmailCampaigns
  class NewIdeaForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      idea = Idea.published.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          idea_submitted_at: idea.submitted_at&.iso8601,
          idea_published_at: idea.published_at&.iso8601,
          idea_title_multiloc: idea.title_multiloc,
          idea_author_name: idea.author_name,
          idea_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient_user.locale)),
          idea_publication_status: idea.publication_status
        }
      }
      campaign = EmailCampaigns::Campaigns::NewIdeaForAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
