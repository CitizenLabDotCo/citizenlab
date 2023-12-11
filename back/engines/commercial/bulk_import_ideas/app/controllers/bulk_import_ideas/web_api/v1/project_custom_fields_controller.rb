# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ProjectCustomFieldsController < ::WebApi::V1::ProjectCustomFieldsController
    def to_pdf
      phase = params[:phase_id] ? Phase.find(params[:phase_id]) : TimelineService.new.current_phase(project)
      locale = params[:locale] || current_user.locale
      personal_data_enabled = params[:personal_data] == 'true'

      if phase
        pdf = PrintCustomFieldsService.new(
          phase,
          custom_fields,
          locale,
          personal_data_enabled
        ).create_pdf

        send_data(
          pdf.render,
          type: 'application/pdf',
          filename: 'survey.pdf'
        )
      else
        send_not_found
      end
    end
  end
end
