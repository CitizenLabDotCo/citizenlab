# frozen_string_literal: true

module EmailCampaigns
  class MentionInInternalCommentMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { authorNameFirst: event.initiating_user_first_name })
    end

    def header_title
      format_message('main_header', values: { authorNameFirst: event.initiating_user_first_name })
    end

    def header_message
      format_message('event_description', values: { authorNameFull: event.internal_comment_author_name })
    end

    def preheader
      format_message('preheader', values: { authorNameFull: event.internal_comment_author_name })
    end
  end
end
