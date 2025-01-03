# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnYourInternalCommentMailer < BaseInternalCommentMailer
    protected

    def preheader
      format_message('preheader', values: {
        post: localize_for_recipient(event.idea_title_multiloc),
        authorName: event.internal_comment_author_name
      })
    end
  end
end
