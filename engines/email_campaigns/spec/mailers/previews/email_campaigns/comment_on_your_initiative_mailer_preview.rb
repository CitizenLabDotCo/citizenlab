module EmailCampaigns
  class CommentOnYourInitiativeMailerPreview < ActionMailer::Preview
    def campaign_mail
      invitee = User.first
      inviter = User.last

      command = {
        recipient: invitee,
        event_payload: {
          "initiating_user_first_name": "Fred",
          "initiating_user_last_name": "Kroket",
          "comment_author_name": "Fred Kroket",
          "comment_body_multiloc": {
            "nl-BE": "Zoiets?\n<a href=\"https://imgur.com/a/9Kw42xT\" target=\"_blank\">https://imgur.com/a/9Kw42xT</a>"
          },
          "comment_url": "http://localhost:3000/nl-BE/ideas/wijgmaal-verkeersvrij-dorpsplein",
          "post_published_at": "2019-05-22T18:21:44Z",
          "post_title_multiloc": {
            "nl-BE": "Wijgmaal verkeersvrij dorpsplein"
          },
          "post_author_name": "Sander Van Garsse"
        }
      }

      campaign = EmailCampaigns::Campaigns::CommentOnYourInitiative.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
