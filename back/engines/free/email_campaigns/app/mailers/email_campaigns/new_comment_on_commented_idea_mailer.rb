# frozen_string_literal: true

module EmailCampaigns
  class NewCommentOnCommentedIdeaMailer < ApplicationMailer
    protected

    def subject
      format_message('subject1')
    end

    def header_title
      format_message('main_header1', values: { commentAuthor: event.initiating_user_first_name })
    end

    def header_message
      format_message('event_description1', values: {
        commentAuthorFull: "#{event.initiating_user_first_name} #{event.initiating_user_last_name}",
        commentAuthor: event.initiating_user_first_name,
        ideaTitle: localize_for_recipient(event.post_title_multiloc),
        organizationName: organization_name
      })
    end

    def preheader
      format_message('preheader1', values: { organizationName: organization_name, commentAuthor: event.initiating_user_first_name })
    end
  end
end
