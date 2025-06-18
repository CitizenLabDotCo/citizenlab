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

      random_user = User.offset(rand(User.count)).first
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      comment = Comment.first
      # TODO: Not all these values are used
      # TODO: Can we use these to auto populate what is available in the editable regions? Probably not
      command = {
                   recipient: recipient,
                   event_payload: {
                     initiating_user_first_name: random_user.first_name,
                     initiating_user_last_name: name_service.last_name!(random_user),
                     comment_author_name: name_service.display_name!(random_user),
                     comment_body_multiloc: comment&.body_multiloc || { 'en' => 'Example Comment' },
                     comment_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale)) || '#',
                     idea_published_at: Time.now.iso8601,
                     idea_title_multiloc: comment&.idea.title_multiloc || { 'en' => 'Example Idea' },
                     idea_input_term: 'idea',
                     idea_author_name: name_service.display_name!(random_user),
                     unfollow_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale)) || '#',
                   }
                 }
      # # TODO: Test this method does not persist any new data
      # comment = Comment.first || Comment.create(idea: Idea.where(creation_phase: nil).first, author: recipient, body_multiloc: { 'en' => 'I agree' })
      # notification = Notifications::CommentOnIdeaYouFollow.new(
      #   recipient_id: recipient.id,
      #   initiating_user: comment.author,
      #   idea: comment.idea,
      #   comment: comment,
      #   project_id: comment.idea.project_id
      # )
      # activity = Activity.new(item: notification, action: 'created')
      #
      # command = campaign.generate_commands(
      #   activity: activity,
      #   recipient: recipient
      # ).first.merge({ recipient: recipient })
      #
      # binding.pry

      with(campaign: campaign, command: command).campaign_mail
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name,
        input_title: localize_for_recipient(event.idea_title_multiloc),
        authorName: event.comment_author_name,
        authorNameFull: event.comment_author_name,
        commentAuthor: event.initiating_user_first_name&.capitalize
      }
    end

    def subject
      format_editable_region(
        region_key: :subject_multiloc,
        values: substitution_variables
      )
    end

    def header_title
      format_editable_region(
        region_key: :title_multiloc,
        values: substitution_variables
      )
    end

    # TODO: This is a HTML region, changed the template to use <%== %> but we need to ensure it's always sanitised before output.
    def header_message
      format_editable_region(
        region_key: :intro_multiloc,
        values: substitution_variables
      )
    end

    def cta_button_text
      format_editable_region(
        region_key: :button_text_multiloc,
        values: substitution_variables
      )
    end

    # TODO: What is preheader and does this need customization also?
    def preheader
      format_message('preheader', values: substitution_variables)
    end
  end
end
