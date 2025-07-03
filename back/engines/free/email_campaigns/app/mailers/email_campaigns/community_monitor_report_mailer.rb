# frozen_string_literal: true

module EmailCampaigns
  class CommunityMonitorReportMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'title'
          ),
          define_editable_region(
            :intro_multiloc, default_message_key: 'text_introduction', type: 'html', allow_blank_locales: true
          ),
          define_editable_region(
            :button_text_multiloc, default_message_key: 'cta_report_button'
          )
        ]
      end

      def preview_command(recipient: nil)
        {
          recipient: recipient,
          event_payload: {
            report_url: "#{Frontend::UrlService.new.home_url(locale: Locale.new(recipient.locale))}/admin/community-monitor/reports"
          }
        }
      end
    end
  end
end
