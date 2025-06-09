# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer

    # TODO: Test that variables match the variables in the default text
    # TODO: What about the difference based on idea term?
    def self.editable_regions
      translation_group = 'email_campaigns.comment_on_idea_you_follow'
      [
        editable_region(
          'subject',
          default_value_key: "#{translation_group}.subject",
          variables: ['input_title']
        ),
        editable_region(
          'header',
          default_value_key: "#{translation_group}.main_header.idea",
          variables: ['authorName']
        ),
        editable_region(
          'body',
          type: 'html',
          default_value_key: "#{translation_group}.event_description",
          variables: %w[authorName authorNameFull inputTitle]
        ),
      ]
    end

    protected

    def subject
      format_custom_text('subject', values: { input_title: localize_for_recipient(event.idea_title_multiloc) })
    end

    def header_title
      format_custom_text("header", values: { authorName: event.comment_author_name })
    end

    def header_message
      format_custom_text(
        'body',
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
