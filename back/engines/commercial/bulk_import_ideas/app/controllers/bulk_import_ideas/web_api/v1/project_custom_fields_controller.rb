# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ProjectCustomFieldsController < ::WebApi::V1::ProjectCustomFieldsController
    def to_pdf
      phase_id = params[:phase_id]
      locale = params[:locale] || current_user.locale
      personal_data_enabled = params[:personal_data] == 'true'
      pdf = PrintCustomFieldsService.new(
        phase_id ? Phase.find(phase_id) : participation_context,
        custom_fields,
        locale,
        personal_data_enabled
      ).create_pdf

      send_data(
        pdf.render,
        type: 'application/pdf',
        filename: 'survey.pdf'
      )
    end
  end
end
