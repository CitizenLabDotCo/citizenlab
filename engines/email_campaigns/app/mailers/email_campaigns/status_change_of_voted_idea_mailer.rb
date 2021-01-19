# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOfVotedIdeaMailer < ApplicationMailer
    private

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'event_description',
        values: {
          ideaTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name
        }
      )
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
