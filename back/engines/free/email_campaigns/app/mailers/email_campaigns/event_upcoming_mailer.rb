# frozen_string_literal: true

module EmailCampaigns
  class EventUpcomingMailer < ApplicationMailer
    private

    def event_title
      localize_for_recipient(event.event_title_multiloc)
    end

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header')
    end

    # def header_message
    #   format_message('event_description', values: { projectName: project_title })
    # end

    def preheader
      format_message('preheader')
    end
  end
end
