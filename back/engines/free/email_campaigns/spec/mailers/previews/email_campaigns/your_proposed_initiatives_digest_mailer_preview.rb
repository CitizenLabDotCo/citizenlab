# frozen_string_literal: true

module EmailCampaigns
  class YourProposedInitiativesDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      initiatives = Initiative.take(3)
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          initiatives: initiatives.map do |initiative|
            {
              title_multiloc: initiative.title_multiloc,
              body_multiloc: initiative.body_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: initiative.published_at&.iso8601,
              likes_count: initiative.likes_count,
              reactions_needed: initiative.reactions_needed,
              reactions_this_week: initiative.likes.where('created_at > ?', Time.now - 1.week).count,
              comments_count: initiative.comments_count,
              expires_at: initiative.expires_at&.iso8601,
              status_code: initiative.initiative_status.code,
              images: initiative.initiative_images.map do |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                }
              end,
              header_bg: {
                versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
              }
            }
          end
        }
      }
      campaign = EmailCampaigns::Campaigns::YourProposedInitiativesDigest.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
