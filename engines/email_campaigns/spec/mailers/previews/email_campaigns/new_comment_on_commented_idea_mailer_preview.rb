module EmailCampaigns
  class NewCommentOnCommentedIdeaMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first

      command = {
        recipient: recipient,
        event_payload: {
          "initiating_user_first_name": "Ronny",
          "initiating_user_last_name": "Vanden Bempt",
          "post_published_at": "2019-04-30T20:00:04Z",
          "post_title_multiloc": {
            "nl-BE": "leuven autobusvrij"
          },
          "comment_body_multiloc": {
            "nl-BE": "<span class=\"cl-mention-user\" data-user-id=\"8033c17d-7ea2-4fc4-9895-8f98b589303a\" data-user-slug=\"matthias-vandegaer\">@Matthias Vandegaer</span> Interessant. Misschien te combineren met een vlottere busafhandeling op de ring: <a href=\"https://leuvenmaakhetmee.be/nl-BE/ideas/leuvense-ring-enkelrichting-voor-privevervoer\" target=\"_blank\">https://leuvenmaakhetmee.be/nl-BE/ideas/leuvense-ring-enkelrichting-voor-privevervoer</a>?"
          },
          "comment_url": "http://localhost:3000/nl-BE/ideas/leuven-autobusvrij"
        }
      }

      campaign = EmailCampaigns::Campaigns::NewCommentOnCommentedIdea.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
