# frozen_string_literal: true

module EmailCampaigns
  class InvitationToCosponsorInitiativeMailer < ApplicationMailer
    protected

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header')
    end

    private

    def header_message
      format_message('event_description_initiative', values: { authorName: event.post_author_name })
    end

    def preheader
      format_message('preheader_initiative', values: { authorName: event.post_author_name })
    end
  end
end
