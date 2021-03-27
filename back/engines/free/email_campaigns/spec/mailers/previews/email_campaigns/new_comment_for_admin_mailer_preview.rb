module EmailCampaigns
  class NewCommentForAdminMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first

      command = {
        recipient: recipient,
        event_payload: {
          "initiating_user_first_name": "Chewbacca",
          "initiating_user_last_name": nil,
          "comment_author_name": "Chewbacca",
          "comment_body_multiloc": {
            "en": "Ruh roooarrgh yrroonn wyaaaaaa ahuma hnn-rowr ma"
          },
          "comment_url": "http:\/\/localhost:3000\/en\/initiatives\/wiki-roulette",
          "post_published_at": "2019-08-23T14:04:13Z",
          "post_title_multiloc": {
            "en": "Wiki Roulette"
          },
          "post_author_name": "K\u00c3\u00bcn Gremmelpret",
          "post_type": "Initiative"
        }
      }

      campaign = EmailCampaigns::Campaigns::NewCommentForAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
