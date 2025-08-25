# frozen_string_literal: true

module EmailCampaigns
  class SurveySubmittedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        projectName: localize_for_recipient(event&.project_title_multiloc)
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          idea_id: data.idea.id,
          project_title_multiloc: data.project.title_multiloc,
          profile_url: "#{Frontend::UrlService.new.home_url}/profile/#{recipient.slug}/surveys",
          has_password: true
        }
      }
    end
  end
end
