# frozen_string_literal: true

module EmailCampaigns
  class NewCommentForAdminMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        firstName: recipient&.first_name,
        authorName: event&.comment_author_name || format_message('anonymous_user', component: 'new_comment_for_admin'),
        authorFirstName: event&.initiating_user_first_name
      }
    end

    def preview_command(recipient, _context)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data.initiator.first_name,
          initiating_user_last_name: data.initiator.last_name,
          comment_author_name: data.initiator.display_name,
          comment_body_multiloc: data.comment.body_multiloc,
          comment_url: data.comment.url,
          idea_published_at: (Time.now - 2.days).iso8601,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_author_name: data.author.display_name
        }
      }
    end

    protected

    helper_method :time_ago

    def time_ago(d)
      diff_days = ((Time.now - Time.parse(d)) / 1.day)
      if diff_days < 1
        format_message('today')
      elsif diff_days < 2
        format_message('yesterday')
      else
        format_message('days_ago', values: { numberOfDays: diff_days.floor })
      end
    end
  end
end
