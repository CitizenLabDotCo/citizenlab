module EmailCampaigns
  class YourProposedInitiativesDigestMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first
      initiatives = Initiative.take(3)
      command = {
        recipient: recipient,
        event_payload: {
          initiatives: initiatives.map{ |initiative|
            {
              title_multiloc: initiative.title_multiloc,       
              body_multiloc: initiative.body_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: initiative.published_at&.iso8601,
              upvotes_count: initiative.upvotes_count,
              votes_needed: initiative.votes_needed,
              votes_this_week: initiative.upvotes.where('created_at > ?', Time.now - 1.week).count,
              comments_count: initiative.comments_count,
              expires_at: initiative.expires_at&.iso8601,
              status_code: initiative.initiative_status.code,
              images: initiative.initiative_images.map{ |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
                }
              },
              header_bg: {
                versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            }
          }
        }
      }
      campaign = EmailCampaigns::Campaigns::YourProposedInitiativesDigest.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
