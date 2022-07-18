# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    def bulk_create_xlsx
      authorize :import_ideas
      service = ImportIdeasService.new
      xlsx = parse_xlsx
      idea_rows = service.xlsx_to_idea_rows xlsx
      service.import_ideas idea_rows, max_ideas: 100
      head :ok
    rescue BulkImportIdeas::Error => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def example_xlsx
      authorize :import_ideas
      xlsx = ImportIdeasService.new.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end

    private

    def bulk_create_xlsx_params
      params
        .require(:invites)
        .permit(:xlsx)
    end

    def parse_xlsx
      xlsx_base64 = bulk_create_xlsx_params[:xlsx]
      start = xlsx_base64.index ';base64,'
      xlsx_base64 = xlsx_base64[(start + 8)..] if start

      xlsx_io = StringIO.new Base64.decode64(xlsx_base64)
      XlsxService.new.xlsx_to_hash_array xlsx_io
    end
  end
end
