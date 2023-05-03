# frozen_string_literal: true

module EmailCampaigns
  class NewCommentOnVotedIdeaMailer < ApplicationMailer
    private

    helper_method :comment_author

    def comment_author
      event.initiating_user_first_name.capitalize
    end

    def subject
      format_message('subject1')
    end

    def header_title
      format_message('main_header1', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message(
        'event_description1',
        values: {
          ideaTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name,
          commentAuthor: comment_author
        }
      )
    end

    def preheader
      format_message(
        'preheader1',
        values: { organizationName: organization_name, commentAuthor: comment_author }
      )
    end
  end
end
