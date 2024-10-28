# frozen_string_literal: true

module EmailCampaigns
  class YourInputInScreeningMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: {
        input_title: localize_for_recipient(event.input_title_multiloc)
      })
    end

    private

    def header_title
      format_message("main_header.#{event.input_term}", values: {
        prescreening_status_title: localize_for_recipient(event.prescreening_status_title_multiloc)
      })
    end

    def header_message
      format_message('message', values: {
        input_title: localize_for_recipient(event.input_title_multiloc),
        prescreening_status_title: localize_for_recipient(event.prescreening_status_title_multiloc)
      })
    end

    def preheader
      format_message('preheader', values: {
        prescreening_status_title: localize_for_recipient(event.prescreening_status_title_multiloc)
      })
    end
  end
end
