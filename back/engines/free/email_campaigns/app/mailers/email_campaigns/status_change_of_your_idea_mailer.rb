# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOfYourIdeaMailer < ApplicationMailer
    private

    def subject
      format_message('subject1')
    end

    def header_title
      format_message('main_header1', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'event_description1',
        values: {
          ideaTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name
        }
      )
    end

    def preheader
      format_message('preheader1', values: { organizationName: organization_name })
    end
  end
end
