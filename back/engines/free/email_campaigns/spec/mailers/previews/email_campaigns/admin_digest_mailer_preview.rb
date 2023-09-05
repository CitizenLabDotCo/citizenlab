# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::AdminDigest.first
      initiative = Initiative.first
      idea = Idea.first

      command = {
        recipient: recipient_user,
        event_payload: {
          statistics: {
            activities: {
              new_ideas_count: { increase: 1 },
              new_comments_count: { increase: 1 }
            },
            users: {
              new_users_count: { increase: 1 }
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
