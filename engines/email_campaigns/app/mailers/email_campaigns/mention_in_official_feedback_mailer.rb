# frozen_string_literal: true

module EmailCampaigns
  class MentionInOfficialFeedbackMailer < ApplicationMailer
    private

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('main_header')
    end

    def header_message
      format_message(
        'event_description',
        values: {
          post: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name
        }
      )
    end

    def preheader
      format_message('preheader', values: { commentAuthor: event.initiating_user_first_name })
    end
  end
end
