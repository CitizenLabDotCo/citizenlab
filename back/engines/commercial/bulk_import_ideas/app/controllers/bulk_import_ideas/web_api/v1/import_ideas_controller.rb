# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas

    def bulk_create_xlsx
      xlsx = parse_xlsx
      idea_rows = import_ideas_service.xlsx_to_idea_rows xlsx
      import_ideas_service.import_ideas idea_rows
      sidefx.after_success current_user
      head :ok
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user
      render json: { file: [{ error: e.key, **e.params }] }, status: :unprocessable_entity
    end

    def example_xlsx
      xlsx = import_ideas_service.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end

    private

    def bulk_create_xlsx_params
      params
        .require(:import_ideas)
        .permit(:xlsx)
    end

    def parse_xlsx
      xlsx_base64 = bulk_create_xlsx_params[:xlsx]
      start = xlsx_base64.index ';base64,'
      xlsx_base64 = xlsx_base64[(start + 8)..] if start

      xlsx_io = StringIO.new Base64.decode64(xlsx_base64)
      XlsxService.new.xlsx_to_hash_array xlsx_io
    end

    def import_ideas_service
      @import_ideas_service ||= ImportIdeasService.new
    end

    def authorize_bulk_import_ideas
      authorize :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end
  end
end
