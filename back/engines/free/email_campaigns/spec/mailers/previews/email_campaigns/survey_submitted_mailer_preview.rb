# frozen_string_literal: true

module EmailCampaigns
  class SurveySubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      project = Project.first

      command = {
        recipient: recipient_user,
        event_payload: {
          idea_id: '1234',
          project_title_multiloc: project.title_multiloc,
          profile_url: "#{Frontend::UrlService.new.home_url}/profile/#{recipient_user.slug}/surveys",
          has_password: true
        }
      }

      campaign = EmailCampaigns::Campaigns::SurveySubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
