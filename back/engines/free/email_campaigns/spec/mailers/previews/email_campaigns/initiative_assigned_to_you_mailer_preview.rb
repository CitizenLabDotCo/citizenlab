module EmailCampaigns
  class InitiativeAssignedToYouMailerPreview < ActionMailer::Preview
    def campaign_mail
      initiative = Initiative.first
      recipient = User.first
      command = {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(initiative.author),
          post_published_at: initiative.published_at&.iso8601,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
      campaign = EmailCampaigns::Campaigns::InitiativeAssignedToYou.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
