module EmailCampaigns
  class StatusChangeOfCommentedInitiativeMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::StatusChangeOfCommentedInitiative.first
      initiative = Initiative.first
      status = initiative.initiative_status
      recipient = User.first

      command = {
        recipient: recipient,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_status_id: status.id,
          initiative_status_title_multiloc: status.title_multiloc,
          initiative_status_code: status.code,
          initiative_status_color: status.color
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
