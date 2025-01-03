# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailer < ApplicationMailer
    private

    def subject
      format_message('subject', values: { input_title: localize_for_recipient(event.idea_title_multiloc) })
    end

    def header_title
      format_message('main_header')
    end

    def header_message
      nil
    end

    def preheader
      format_message('preheader')
    end
  end
end
