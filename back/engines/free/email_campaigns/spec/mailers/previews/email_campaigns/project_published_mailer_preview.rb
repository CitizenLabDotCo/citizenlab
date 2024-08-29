# frozen_string_literal: true

module EmailCampaigns
  class ProjectPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.find_by(internal_role: 'open_idea_box')
      activity = Activity.new(item: project, action: 'published')

      campaign = EmailCampaigns::Campaigns::ProjectPublished.first
      command = campaign.generate_commands(
        activity: activity,
        recipient: recipient_user
      ).first.merge({ recipient: recipient_user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
