# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas

    # NOTE: PDF version will only work for a project endpoint
    def bulk_create
      file = bulk_create_params[:pdf] || bulk_create_params[:xlsx]
      file_type = bulk_create_params[:pdf] ? 'pdf' : 'xlsx'
      draft = params[:id] # If project id is present then import as draft

      import_ideas_service.upload_file file, file_type

      idea_rows = if file_type == 'pdf'
        import_ideas_service.pdf_to_idea_rows(parse_pdf)
      else
        import_ideas_service.xlsx_to_idea_rows(parse_xlsx)
      end

      ideas = import_ideas_service.import_ideas idea_rows, import_as_draft: draft
      sidefx.after_success current_user

      render json: ::WebApi::V1::IdeaSerializer.new(
        ideas,
        params: jsonapi_serializer_params,
        include: %i[author idea_import]
      ).serializable_hash, status: :created
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user
      render json: { file: [{ error: e.key, **e.params }] }, status: :unprocessable_entity
    end

    def example_xlsx
      xlsx = import_ideas_service.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end

    def draft_ideas
      ideas = Idea.draft.where(project_id: params[:id])
      render json: linked_json(
        paginate(ideas),
        ::WebApi::V1::IdeaSerializer,
        include: %i[author idea_import],
        params: jsonapi_serializer_params
      )
    end

    def idea_import
      idea_import = IdeaImport.where(idea_id: params[:id]).first
      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    private

    def bulk_create_params
      # TODO: Add other params in here, phase, tags, user custom fields?
      params
        .require(:import_ideas)
        .permit(%i[xlsx pdf locale])
    end

    def import_ideas_service
      locale = params[:import_ideas] ? bulk_create_params[:locale] : current_user.locale
      @import_ideas_service ||= if params[:id]
        ImportProjectIdeasService.new(current_user, params[:id], locale)
      else
        ImportGlobalIdeasService.new(current_user)
      end
    end

    def parse_xlsx
      # TODO: Is StringIO needed here?
      xlsx_file = StringIO.new decode_base64(bulk_create_params[:xlsx])
      XlsxService.new.xlsx_to_hash_array xlsx_file
    end

    def parse_pdf
      pdf_file = decode_base64 bulk_create_params[:pdf]
      google_forms_service = GoogleFormParserService.new pdf_file
      google_forms_service.parse_pdf
    end

    def decode_base64(base64_file)
      start = base64_file.index ';base64,'
      base64_file = base64_file[(start + 8)..] if start
      Base64.decode64(base64_file)
    end

    def authorize_bulk_import_ideas
      authorize :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end
  end
end
