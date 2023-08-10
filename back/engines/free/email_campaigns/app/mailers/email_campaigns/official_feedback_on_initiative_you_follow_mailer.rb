# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnInitiativeYouFollowMailer < ApplicationMailer
    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('header_title', values: { officialName: organization_name })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          initiativeTitle: localize_for_recipient(event.post_title_multiloc),
          officialName: localize_for_recipient(event.official_feedback_author_multiloc),
          organizationName: organization_name
        }
      )
    end
  end
end
