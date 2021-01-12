module EmailCampaigns
  class IdeaPublishedMailerPreview < ActionMailer::Preview
    def campaign_mail
      idea = Idea.first
      recipient = User.first
      command = {
        recipient: recipient,
        event_payload: {
          post_id: idea.id,
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          post_images: idea.idea_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map { |k, v| [k.to_s, v.url] }.to_h
            }
          end
        }
      }
      campaign = EmailCampaigns::Campaigns::IdeaPublished.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
