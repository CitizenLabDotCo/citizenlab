# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseStartedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ProjectPhaseStarted.first

      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          phase_title_multiloc: { 'en' => 'Being implemented' },
          phase_description_multiloc: { 'en' => 'Project is now being implemented' },
          phase_start_at: Time.zone.today.prev_day.iso8601,
          phase_end_at: Time.zone.today.next_month.iso8601,
          phase_url: 'demo.stg.citizenlab.co',
          project_title_multiloc: { 'en' => 'Renovations' },
          project_description_multiloc: { 'en' => 'Renovating the entire city' },
          project_description_preview_multiloc: { 'en' => 'Project description preview text (a.k.a Homepage description)' }
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
