module EmailCampaigns
  class StatusChangeOfVotedIdeaMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::StatusChangeOfVotedIdea.first
      idea = Idea.first
      status = idea.idea_status
      recipient = User.first

      command = {
        recipient: recipient,
        event_payload: {
          post_id: idea.id,
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          post_images: idea.idea_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          idea_status_id: status.id,
          idea_status_title_multiloc: status.title_multiloc,
          idea_status_code: status.code,
          idea_status_color: status.color
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
