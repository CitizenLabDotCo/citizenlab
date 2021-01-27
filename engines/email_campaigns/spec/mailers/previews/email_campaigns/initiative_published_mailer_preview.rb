module EmailCampaigns
  class InitiativePublishedMailerPreview < ActionMailer::Preview
    def campaign_mail
      initiative = Initiative.first
      recipient = User.first
      command = {
        recipient: recipient,
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map { |k, v| [k.to_s, v.url] }.to_h
            }
          end,
          initiative_header_bg: {
            versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }
      campaign = EmailCampaigns::Campaigns::InitiativePublished.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end