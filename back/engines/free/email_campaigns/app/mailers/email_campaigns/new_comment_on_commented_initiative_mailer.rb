# frozen_string_literal: true

module EmailCampaigns
  class NewCommentOnCommentedInitiativeMailer < ApplicationMailer
    private

    helper_method :author_name

    def author_name
      event.initiating_user_first_name.capitalize
    end

    def comment_author_full
      [author_name, event.initiating_user_last_name.capitalize].join(' ')
    end

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header', values: { commentAuthor: author_name })
    end

    def header_message
      format_message(
        'event_description',
        values: {
          initiativeTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name,
          commentAuthor: author_name,
          commentAuthorFull: comment_author_full
        }
      )
    end

    def preheader
      format_message(
        'preheader',
        values: { organizationName: organization_name, commentAuthor: author_name }
      )
    end
  end
end
