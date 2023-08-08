# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas

    def bulk_create_xlsx
      xlsx = parse_xlsx
      idea_rows = import_ideas_service.xlsx_to_idea_rows xlsx
      bulk_create idea_rows
    end

    def example_xlsx
      xlsx = import_ideas_service.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end

    # Note: This will only work on a project endpoint
    def bulk_create_pdf
      docs = parse_pdf
      idea_rows = import_ideas_service.paper_docs_to_idea_rows docs
      bulk_create idea_rows
    end

    private

    def bulk_create(idea_rows)
      import_ideas_service.import_ideas idea_rows
      sidefx.after_success current_user
      head :ok
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user
      render json: { file: [{ error: e.key, **e.params }] }, status: :unprocessable_entity
    end

    def bulk_create_xlsx_params
      params
        .require(:import_ideas)
        .permit(:xlsx)
    end

    def bulk_create_pdf_params
      params
        .require(:import_ideas)
        .permit(:pdf)
    end

    def parse_xlsx
      xlsx_base64 = bulk_create_xlsx_params[:xlsx]
      start = xlsx_base64.index ';base64,'
      xlsx_base64 = xlsx_base64[(start + 8)..] if start

      xlsx_io = StringIO.new Base64.decode64(xlsx_base64)
      XlsxService.new.xlsx_to_hash_array xlsx_io
    end

    def parse_pdf
      pdf_base64 = bulk_create_pdf_params[:pdf]
      start = pdf_base64.index ';base64,'
      pdf_base64 = pdf_base64[(start + 8)..] if start
      pdf_io = Base64.decode64(pdf_base64)
      google_forms_service = GoogleFormParserService.new pdf_io
      google_forms_service.parse_paper_form
    end

    def import_ideas_service
      @import_ideas_service ||= params[:project_id] ? ImportProjectIdeasService.new(params[:project_id]) : ImportIdeasService.new
    end

    def authorize_bulk_import_ideas
      authorize :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end
  end
end
