# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer
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
          :subject_multiloc,
          default_message_key: 'subject',
          variables: ['input_title']
        ),
        editable_region(
          :title_multiloc,
          default_message_key: 'main_header.idea',
          variables: ['authorName']
        ),
        editable_region(
          :intro_multiloc,
          type: 'html',
          default_message_key: 'event_description',
          variables: %w[authorName authorNameFull inputTitle],
          allow_blank_locales: true
        ),
        editable_region(
          :button_text_multiloc,
          default_message_key: 'cta_reply_to',
          variables: %w[commentAuthor inputTitle]
        )
      ]
    end

    def self.preview_email(campaign: nil, recipient: nil)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      url_service = Frontend::UrlService.new
      comment = Comment.first
      author = comment&.author

      command = {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: author.first_name,
          comment_author_name: name_service.display_name!(author),
          comment_body_multiloc: comment&.body_multiloc || { 'en' => 'Example Comment' },
          comment_url: url_service.model_to_url(comment, locale: Locale.new(recipient.locale)) || '#',
          idea_title_multiloc: comment&.idea&.title_multiloc || { 'en' => 'Example Idea' },
          idea_input_term: 'idea',
          unfollow_url: url_service.model_to_url(comment, locale: Locale.new(recipient.locale)) || '#'
        }
      }
      with(campaign: campaign, command: command).campaign_mail
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name,
        input_title: localize_for_recipient(event.idea_title_multiloc),
        inputTitle: localize_for_recipient(event.idea_title_multiloc),
        authorName: event.comment_author_name,
        authorNameFull: event.comment_author_name,
        commentAuthor: event.initiating_user_first_name&.capitalize
      }
    end

    def subject
      format_editable_region(
        region_key: :subject_multiloc
      )
    end

    def header_title
      format_editable_region(
        region_key: :title_multiloc
      )
    end

    def header_message
      format_editable_region(
        region_key: :intro_multiloc
      )
    end

    def cta_button_text
      format_editable_region(
        region_key: :button_text_multiloc
      )
    end

    def preheader
      format_message('preheader')
    end
  end
end
