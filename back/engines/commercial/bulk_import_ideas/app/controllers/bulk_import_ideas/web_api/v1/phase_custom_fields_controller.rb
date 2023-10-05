# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::PhaseCustomFieldsController < ::WebApi::V1::PhaseCustomFieldsController
    def to_pdf
      locale = params[:locale] || current_user.locale
      personal_data_enabled = params[:personal_data] == 'true'
      if phase
        pdf = BulkImportIdeas::PrintCustomFieldsService.new(
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
