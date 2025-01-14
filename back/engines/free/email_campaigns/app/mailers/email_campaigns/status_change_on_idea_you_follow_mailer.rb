# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnIdeaYouFollowMailer < ApplicationMailer
    private

    def preheader
      format_message('preheader')
    end

    def subject
      format_message('subject', values: { input_title: localize_for_recipient(event.idea_title_multiloc) })
    end

    def header_title
      format_message('header_title', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          input_title: localize_for_recipient(event.idea_title_multiloc),
          organizationName: organization_name
        }
      )
    end
  end
end
