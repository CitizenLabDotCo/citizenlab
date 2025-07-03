# frozen_string_literal: true

module EmailCampaigns
  class CommunityMonitorReportMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def preview_command(recipient)
      {
        recipient: recipient,
        event_payload: {
          report_url: "#{Frontend::UrlService.new.home_url(locale: Locale.new(recipient.locale))}/admin/community-monitor/reports"
        }
      }
    end
  end
end
