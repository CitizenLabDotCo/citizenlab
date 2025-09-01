# frozen_string_literal: true

module EmailCampaigns
  class YourInputInScreeningMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc intro_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        prescreening_status_title: localize_for_recipient(event&.prescreening_status_title_multiloc),
        input_title: localize_for_recipient(event&.input_title_multiloc)
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          input_title_multiloc: data.idea.title_multiloc,
          input_body_multiloc: data.idea.body_multiloc,
          input_url: data.idea.url,
          prescreening_status_title_multiloc: data.input_status.title_multiloc,
          prescreening_status_description_multiloc: data.input_status.description_multiloc,
          input_term: 'idea'
        }
      }
    end

    private

    def header_title
      format_message("main_header.#{event.input_term}", values: {
        prescreening_status_title: localize_for_recipient(event.prescreening_status_title_multiloc)
      })
    end
  end
end
