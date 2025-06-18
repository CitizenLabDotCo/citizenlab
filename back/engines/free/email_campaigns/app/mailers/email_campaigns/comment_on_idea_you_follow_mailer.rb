# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    # TODO: What about the difference based on idea term here?
    # Maybe change the actual translations to include as a variable 'an idea' or 'a proposal'?
    def self.campaign_class
      Campaigns::CommentOnIdeaYouFollow
    end

    def self.editable_regions
      [
        define_editable_region(
          :subject_multiloc,
          default_message_key: 'subject',
          variables: ['input_title']
        ),
        define_editable_region(
          :title_multiloc,
          default_message_key: 'main_header.idea',
          variables: ['authorName']
        ),
        define_editable_region(
          :intro_multiloc,
          type: 'html',
          default_message_key: 'event_description',
          variables: %w[authorName authorNameFull inputTitle],
          allow_blank_locales: true
        ),
        define_editable_region(
          :button_text_multiloc,
          default_message_key: 'cta_reply_to',
          variables: %w[commentAuthor inputTitle]
        )
      ]
    end

    def self.preview_command(recipient: nil)
      data = preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data[:first_name],
          comment_author_name: data[:display_name],
          comment_body_multiloc: data[:comment_body_multiloc],
          comment_url: data[:idea_url],
          idea_title_multiloc: data[:idea_title_multiloc],
          idea_input_term: 'idea',
          unfollow_url: data[:idea_url]
        }
      }
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name,
        input_title: localize_for_recipient(event.idea_title_multiloc),
        inputTitle: localize_for_recipient(event.idea_title_multiloc),
        authorName: event.comment_author_name,
        authorNameFull: event.comment_author_name,
        commentAuthor: event.initiating_user_first_name&.capitalize,
      }
    end

    def subject
      format_editable_region(:subject_multiloc)
    end

    def header_title
      format_editable_region(:title_multiloc)
    end

    def header_message
      format_editable_region(:intro_multiloc)
    end

    def cta_button_text
      format_editable_region(:button_text_multiloc)
    end

    def preheader
      format_message('preheader', values: substitution_variables)
    end
  end
end
