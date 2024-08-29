# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnIdeaYouFollowMailer < ApplicationMailer
    private

    def subject
      format_message('subject')
    end

    def header_title
      format_message('header_title', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          input_title: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name
        }
      )
    end
  end
end
