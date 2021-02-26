module EmailCampaigns
  class CommentOnYourCommentMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: {organizationName: organization_name})
    end

    def header_title
      format_message('main_header', values: {authorName: event.comment_author_name})
    end

    def header_message
      format_message('event_description', values: {
        authorNameFull: event.comment_author_name,
        authorName: event.initiating_user_first_name,
        post: localize_for_recipient(event.post_title_multiloc)
      })
    end

    def preheader
      format_message('preheader', values: {
        organizationName: organization_name,
        authorName: event.comment_author_name
      })
    end
  end
end
