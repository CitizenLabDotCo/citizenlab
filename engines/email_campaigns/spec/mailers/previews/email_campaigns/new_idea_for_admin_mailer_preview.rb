module EmailCampaigns
  class NewIdeaForAdminMailerPreview < ActionMailer::Preview
    def campaign_mail
      idea = Idea.first
      recipient = User.first
      command = {
        recipient: recipient,
        event_payload: {
          post_published_at: idea.published_at.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::NewIdeaForAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end