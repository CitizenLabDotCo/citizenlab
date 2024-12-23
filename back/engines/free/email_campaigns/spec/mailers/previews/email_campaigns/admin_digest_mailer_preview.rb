# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::AdminDigest.first
      idea = Idea.published.first

      # # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          statistics: {
            new_inputs_increase: 1,
            new_comments_increase: 1,
            new_users_increase: 1
          },
          top_project_inputs: [
            {
              project: { url: 'some_fake_url', title_multiloc: { 'en' => 'project title' } },
              current_phase: nil,
              top_ideas: [campaign.serialize_input(idea)]
            }
          ],
          successful_proposals: [campaign.serialize_proposal(idea)]
        },
        tracked_content: {
          idea_ids: [idea.id]
        }
      }

      campaign.mailer_class.with(campaign:, command:).campaign_mail
    end
  end
end
