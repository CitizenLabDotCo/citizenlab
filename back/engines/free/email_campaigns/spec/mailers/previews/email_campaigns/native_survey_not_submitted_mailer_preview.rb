# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first
      idea = Idea.where.not(creation_phase: nil).order(created_at: :asc).first
      if idea.nil?
        project = Project.create!(
          title_multiloc: { 'en' => 'Created for survey not submitted mail preview' },
          description_multiloc: { 'en' => 'Created for survey not submitted mail preview' },
          slug: 'for-survey-not-submitted-mail-preview',
          visible_to: 'public'
        )
        phase = Phase.create!(
          project: project,
          title_multiloc: { 'en' => 'Created for survey not submitted mail preview' },
          description_multiloc: { 'en' => 'Created for survey not submitted mail preview' },
          start_at: Time.now - 1.day,
          end_at: Time.now + 1.day,
          participation_method: 'native_survey',
          submission_enabled: true,
          native_survey_title_multiloc: { 'en' => 'Survey' },
          native_survey_button_multiloc: { 'en' => 'Take the survey' },
          campaigns_settings: { 'project_phase_started' => true }
        )
        idea = Idea.create!(
          project: project,
          creation_phase: phase,
          author: recipient_user
        )
      end
      item = Notifications::NativeSurveyNotSubmitted.new(idea: idea)
      user = recipient_user
      activity = Activity.new(item: item, user: user)
      commands = campaign.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
