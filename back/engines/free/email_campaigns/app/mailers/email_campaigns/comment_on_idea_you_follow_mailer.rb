# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer
    # TODO: Test that variables match the variables in the default text
    # TODO: What about the difference based on idea term here?
    # Maybe change the actual translations to include as a variable 'an idea' or 'a proposal'?
    def self.campaign_class
      Campaigns::CommentOnIdeaYouFollow
    end

    # Returns the editable regions for this campaign.
    # These regions are used to define the custom text that can be edited by the user.
    def self.editable_regions
      [
        editable_region(
          'subject',
          variables: ['input_title']
        ),
        editable_region(
          'header_title',
          message_key: 'main_header.idea',
          variables: ['authorName']
        ),
        editable_region(
          'header_message',
          type: 'html',
          message_key: 'event_description',
          variables: %w[authorName authorNameFull inputTitle]
        ),
        editable_region(
          'cta_button_text',
          message_key: 'cta_reply_to',
          variables: %w[commentAuthor inputTitle]
        )
      ]
    end

    protected

    def subject
      format_editable_region(
        region_key: 'subject',
        values: {
          input_title: localize_for_recipient(event.idea_title_multiloc)
        }
      )
    end

    def header_title
      format_editable_region(
        region_key: 'header_title',
        values: {
          authorName: event.comment_author_name
        }
      )
    end

    def header_message
      format_editable_region(
        region_key: 'header_message',
        values: {
          authorNameFull: event.comment_author_name,
          authorName: event.initiating_user_first_name,
          inputTitle: localize_for_recipient(event.idea_title_multiloc)
        }
      )
    end

    def cta_button_text
      format_editable_region(
        region_key: 'cta_button_text',
        values: {
          commentAuthor: event.initiating_user_first_name&.capitalize,
          inputTitle: localize_for_recipient(event.idea_title_multiloc)
        }
      )
    end

    # TODO: What is preheader and does this need customization also?
    def preheader
      format_message('preheader', values: { organizationName: organization_name, authorName: event.comment_author_name })
    end
  end
end
