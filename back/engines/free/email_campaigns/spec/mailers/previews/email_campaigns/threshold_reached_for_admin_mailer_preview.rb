# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ThresholdReachedForAdmin.first
      post = Idea.first

      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          post_title_multiloc: { 'en' => 'A nice idea' },
          post_body_multiloc: { 'en' => 'A nice idea' },
          post_published_at: Time.zone.today.prev_week.iso8601,
          post_author_name: 'Chuck Norris',
          post_url: 'demo.stg.govocal.com',
          post_likes_count: 3,
          post_comments_count: 4,
          post_images: post.idea_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          assignee_first_name: 'Lady',
          assignee_last_name: 'Gaga'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
