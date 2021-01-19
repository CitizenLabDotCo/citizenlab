module EmailCampaigns
  class AdminDigestMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::AdminDigest.first
      initiative = Initiative.first
      idea = Idea.first

      command = {
        recipient: User.first,
        event_payload: {
          statistics: {
            activities: {
              new_ideas: { increase: 1 },
              new_initiatives: { increase: 1 },
              new_votes: { increase: 1 },
              new_comments: { increase: 1 },
              total_ideas: 1,
              total_initiatives: 2,
              total_users: 3
            },
            users: {
              new_visitors: { increase: 1 },
              new_users: { increase: 1 },
              active_users: { increase: 1 }
            }
          },
          top_project_ideas: [
            {
              project: { url: 'some_fake_url', title_multiloc: { 'en' => 'project title' } },
              current_phase: nil,
              top_ideas: [campaign.serialize_idea(idea)]
            }
          ],
          new_initiatives: [campaign.serialize_initiative(initiative)],
          successful_initiatives: [campaign.serialize_initiative(initiative)]
        },
        tracked_content: {
          idea_ids: [],
          initiative_ids: []
        }
      }


      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
