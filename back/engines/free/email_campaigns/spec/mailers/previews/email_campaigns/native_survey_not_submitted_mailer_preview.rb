# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first
      idea = Idea.where.not(creation_phase: nil).order(created_at: :asc).first
      item = Notifications::NativeSurveyNotSubmitted.new(post: idea)
      user = idea.author
      activity = Activity.new(item: item, user: user)
      commands = campaign.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
