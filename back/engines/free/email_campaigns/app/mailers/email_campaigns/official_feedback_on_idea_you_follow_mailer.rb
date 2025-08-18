# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        feedback_author_name: localize_for_recipient(event.official_feedback_author_multiloc),
        input_title: localize_for_recipient(event&.idea_title_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          official_feedback_author_multiloc: multiloc_service.block_to_multiloc { data.initiator.display_name },
          official_feedback_body_multiloc: data.official_feedback.body_multiloc,
          official_feedback_url: data.official_feedback.url,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_body_multiloc: data.idea.body_multiloc,
          idea_author_name: data.author.display_name,
          unfollow_url: data.idea.url
        }
      }
    end

    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end
  end
end
