# frozen_string_literal: true

module EmailCampaigns
  class InvitationToCosponsorIdeaMailer < ApplicationMailer
    protected

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header')
    end

    private

    def header_message
      format_message('event_description', values: { authorName: event.post_author_name })
    end

    def preheader
      format_message('preheader', values: { authorName: event.post_author_name })
    end
  end
end
