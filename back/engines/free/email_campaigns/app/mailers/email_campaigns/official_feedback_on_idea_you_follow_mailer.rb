# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnIdeaYouFollowMailer < ApplicationMailer
    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end

    def preheader
      format_message('preheader')
    end

    def subject
      format_message('subject', values: { organizationName: organization_name, input_title: localize_for_recipient(event.post_title_multiloc) })
    end

    def header_title
      format_message('header_title', values: { organizationName: organization_name, input_title: localize_for_recipient(event.post_title_multiloc) })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          input_title: localize_for_recipient(event.post_title_multiloc),
          feedback_author_name: localize_for_recipient(event.official_feedback_author_multiloc)
        }
      )
    end
  end
end
