# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnYourInternalCommentMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { post: localize_for_recipient(event.post_title_multiloc) })
    end

    def header_title
      format_message('main_header', values: { post: localize_for_recipient(event.post_title_multiloc) })
    end

    def header_message
      format_message('event_description', values: { authorNameFull: event.internal_comment_author_name })
    end

    def preheader
      format_message('preheader', values: {
        post: localize_for_recipient(event.post_title_multiloc),
        authorName: event.internal_comment_author_name
      })
    end
  end
end
