# frozen_string_literal: true

module EmailCampaigns
  class CosponsorOfYourIdeaMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { cosponsorName: event.idea_cosponsor_name })
    end

    def header_title
      format_message('main_header', values: { cosponsorName: event.idea_cosponsor_name })
    end

    private

    def header_message
      format_message('event_description', values: { cosponsorName: event.idea_cosponsor_name })
    end

    def preheader
      format_message('preheader', values: { cosponsorName: event.idea_cosponsor_name })
    end
  end
end
