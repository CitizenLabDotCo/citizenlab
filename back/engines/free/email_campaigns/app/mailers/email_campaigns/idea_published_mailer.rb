# frozen_string_literal: true

module EmailCampaigns
  class IdeaPublishedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc intro_multiloc title_multiloc]
    end

    def substitution_variables
      {
        input_title: localize_for_recipient(event&.idea_title_multiloc),
        projectTitle: localize_for_recipient(event&.project_title_multiloc),
        firstName: recipient_first_name,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          idea_id: data.idea.id,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_body_multiloc: data.idea.body_multiloc,
          idea_url: data.idea.url,
          idea_images: [],
          input_term: 'idea',
          project_title_multiloc: data.project.title_multiloc
        }
      }
    end

    protected

    # Subject has a dynamic default text based on the input term.
    def subject
      format_editable_region(
        :subject_multiloc,
        override_default_key: "input_type_subject.#{event.input_term}"
      )
    end
  end
end
