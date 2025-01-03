# frozen_string_literal: true

module EmailCampaigns
  class MentionInOfficialFeedbackMailer < ApplicationMailer
    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end

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
          post: localize_for_recipient(event.idea_title_multiloc),
          organizationName: organization_name
        }
      )
    end

    def preheader
      # initiating_user_first_name is never present.
      # TODO: fix. We previously removed this field from the event https://github.com/CitizenLabDotCo/citizenlab/commit/72a778f#diff-f9b809a7dcedf9fd13177f3b9b05ac24ddde8f5f36d197d65e256c20b22ae62aL25
      format_message('preheader', values: { commentAuthor: event['initiating_user_first_name'] })
    end
  end
end
