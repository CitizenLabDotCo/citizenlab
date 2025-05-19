# frozen_string_literal: true

module EmailCampaigns
  class CommunityMonitorReportMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::CommunityMonitorReport.new
      command = {
        recipient: recipient_user,
        event_payload: {
          report_url: "#{Frontend::UrlService.new.home_url(locale: Locale.new(recipient_user.locale))}/admin/community-monitor/reports"
        }
      }
      campaign.mailer_class.with(campaign:, command:).campaign_mail
    end
  end
end
