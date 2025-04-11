# frozen_string_literal: true

module EmailCampaigns
  class CommunityMonitorReportMailer < ApplicationMailer
    private

    def subject
      format_message('subject')
    end

    def header_title
      format_message('title')
    end

    def header_message
      format_message('text_introduction')
    end

    def preheader
      format_message('subject')
    end
  end
end
