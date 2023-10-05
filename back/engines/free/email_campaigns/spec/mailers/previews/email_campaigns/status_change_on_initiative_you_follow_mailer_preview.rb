# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnInitiativeYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::StatusChangeOnInitiativeYouFollow.first

      command = {
        recipient: recipient_user,
        event_payload: {
          post_title_multiloc: { 'en' => 'Fence around the park' },
          post_body_multiloc: { 'en' => 'Good morning, I have children with autism and they like to run and have no sense of danger, since the park is near where the cars are parked and near the avenue, it would be good if at least one of the play areas was fenced off. I have been to several parks in various states and that fence has been a blessing for us' },
          post_url: 'http://localhost:4000/en/initiatives/fence-around-the-park',
          post_images: [
            {
              ordering: 0,
              versions: {
                small: 'http://localhost:4000/uploads/small_image.jpeg',
                medium: 'http://localhost:4000/uploads/medium_image.jpeg',
                large: 'http://localhost:4000/uploads/large_image.jpeg',
                fb: 'http://localhost:4000/uploads/fb_image.jpeg'
              }
            }
          ],
          initiative_status_title_multiloc: { 'en' => 'threshold reached' },
          initiative_status_code: 'threshold_reached',
          initiative_status_color: '#04884C'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
