module EmailCampaigns
  class ThresholdReachedForAdminMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ThresholdReachedForAdmin.first
      post = Initiative.first

      command = {
        recipient: User.first,
        event_payload: {
          post_title_multiloc: { 'en' => 'A nice idea' },
          post_body_multiloc: { 'en' => 'A nice idea' },
          post_published_at: Time.zone.today.prev_week.iso8601,
          post_author_name: 'Chuck Norris',
          post_url: 'demo.stg.citizenlab.co',
          post_upvotes_count: 3,
          post_comments_count: 4,
          post_images: post.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_header_bg: {
            versions: post.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          assignee_first_name: 'Lady',
          assignee_last_name: 'Gaga'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
