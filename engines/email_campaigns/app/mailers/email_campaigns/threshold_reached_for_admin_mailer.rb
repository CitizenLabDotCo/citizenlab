# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailer < ApplicationMailer
    private
    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header')
    end

    def header_message
      format_message('event_description')
    end

    def preheader
      format_message('preheader')
    end
  end
end
