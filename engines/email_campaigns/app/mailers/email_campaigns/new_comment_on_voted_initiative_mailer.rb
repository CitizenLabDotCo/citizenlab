# frozen_string_literal: true

module EmailCampaigns
  class NewCommentOnVotedInitiativeMailer < ApplicationMailer
    private

    helper_method :comment_author

    def comment_author
      event.initiating_user_first_name.capitalize
    end

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header', values: { firstName: comment_author })
    end

    def header_message
      format_message(
        'event_description',
        values: {
          initiativeTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name,
          commentAuthor: comment_author
        }
      )
    end

    def preheader
      format_message(
        'preheader',
        values: { organizationName: organization_name, commentAuthor: comment_author }
      )
    end
  end
end
