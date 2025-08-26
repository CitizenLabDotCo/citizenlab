# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketNotSubmittedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        contextTitle: event&.context_title_multiloc
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_url: data.project.url,
          context_title_multiloc: data.phase.title_multiloc
        }
      }
    end
  end
end
