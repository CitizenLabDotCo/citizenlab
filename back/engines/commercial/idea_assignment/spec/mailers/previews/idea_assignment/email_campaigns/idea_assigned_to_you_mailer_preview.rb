module IdeaAssignment
  module EmailCampaigns
    class IdeaAssignedToYouMailerPreview < ActionMailer::Preview
      def campaign_mail
        idea = Idea.first
        recipient = User.first
        command = {
          recipient: recipient,
          event_payload: {
            post_title_multiloc: idea.title_multiloc,
            post_body_multiloc: idea.body_multiloc,
            post_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(idea.author),
            post_published_at: idea.published_at&.iso8601,
            post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
            post_assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601)
          }
        }
        campaign = IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou.first

        campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
      end
    end
  end
end
