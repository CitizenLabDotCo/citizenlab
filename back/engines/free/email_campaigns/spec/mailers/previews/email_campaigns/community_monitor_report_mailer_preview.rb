# frozen_string_literal: true

module EmailCampaigns
  class CommunityMonitorReportPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::CommunityMonitorReport.new
      command = {
        recipient: recipient_user,
        event_payload: {
          event_payload: {
            quarter: 1,
            year: 2025,
            report_url: 'https://example.com/report',
          }
        }
      }
      campaign.mailer_class.with(campaign:, command:).campaign_mail
    end
  end
end
