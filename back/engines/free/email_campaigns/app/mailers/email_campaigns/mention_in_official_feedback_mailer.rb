# frozen_string_literal: true

module EmailCampaigns
  class MentionInOfficialFeedbackMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        post: localize_for_recipient(event&.idea_title_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          official_feedback_author_multiloc: data.initiator.display_name_multiloc,
          official_feedback_body_multiloc: data.comment.body_multiloc,
          official_feedback_url: data.comment.url,
          idea_published_at: Time.zone.today.prev_week.iso8601,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_author_name: data.author.display_name,
          idea_type: 'Idea'
        }
      }
    end

    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event&.official_feedback_author_multiloc)
    end
  end
end
