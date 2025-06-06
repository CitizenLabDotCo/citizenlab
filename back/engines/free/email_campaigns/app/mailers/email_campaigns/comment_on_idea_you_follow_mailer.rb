# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer

    def self.editable_regions
      [
        { key: 'subject', variables: ['input_title'] },
        { key: 'title', variables: ['authorName'] }
      ]
    end

    protected

    def subject
      format_message('subject', values: { input_title: localize_for_recipient(event.idea_title_multiloc) })
    end

    def header_title
      format_message("main_header.#{event.idea_input_term}", values: { authorName: event.comment_author_name })
    end

    def header_message
      format_message(
        'event_description',
        values: {
          authorNameFull: event.comment_author_name,
          authorName: event.initiating_user_first_name,
          inputTitle: localize_for_recipient(event.idea_title_multiloc)
        }
      )
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name, authorName: event.comment_author_name })
    end
  end
end
