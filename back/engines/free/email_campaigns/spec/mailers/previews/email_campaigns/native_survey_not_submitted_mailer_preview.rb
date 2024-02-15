# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      # NEW
      campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first
      idea = Idea.where.not(creation_phase: nil).order(created_at: :asc).first
      item = Notifications::NativeSurveyNotSubmitted.new(post: idea)
      user = idea.author
      activity = Activity.new(item: item, user: user)
      commands = campaign.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })

      # OLD
      # project = Project.first
      # command = {
      #   recipient: recipient_user,
      #   event_payload: {
      #     survey_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
      #     phase_title_multiloc: project.phases.first.title_multiloc || project.title_multiloc,
      #     phase_end_at: project.created_at
      #   }
      # }
      # campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command)
    end
  end
end
