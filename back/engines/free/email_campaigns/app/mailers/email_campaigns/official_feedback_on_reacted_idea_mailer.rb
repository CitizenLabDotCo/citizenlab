# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnReactedIdeaMailer < ApplicationMailer
    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('main_header', values: { firstName: recipient_first_name.capitalize })
    end

    def header_message
      format_message(
        'event_description',
        values: {
          ideaTitle: localize_for_recipient(event.post_title_multiloc),
          officialName: localize_for_recipient(event.official_feedback_author_multiloc)
        }
      )
    end

    def preheader
      format_message('preheader', values: { officialName: author_name })
    end
  end
end
