# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas

    # Show the metadata of a single imported idea
    def show
      idea_import = IdeaImport.where(id: params[:id]).first

      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    # NOTE: PDF version will only work for a project endpoint
    def bulk_create
      file = bulk_create_params[:pdf] || bulk_create_params[:xlsx]
      file_type = bulk_create_params[:pdf] ? 'pdf' : 'xlsx'
      draft = params[:id] # If project id is present then import as draft

      import_ideas_service.upload_file file, file_type
      idea_rows = import_ideas_service.parse_idea_rows file, file_type
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

    private

    def bulk_create_params
      # TODO: Add other params in here: tags/topics, user custom fields?
      params
        .require(:import_ideas)
        .permit(%i[xlsx pdf locale phase_id])
    end

    def import_ideas_service
      locale = params[:import_ideas] ? bulk_create_params[:locale] : current_user.locale
      project_id = params[:id]
      @import_ideas_service ||= if project_id
        phase_id = params[:import_ideas] ? bulk_create_params[:phase_id] : nil
        ImportProjectIdeasService.new(current_user, project_id, locale, phase_id)
      else
        ImportGlobalIdeasService.new(current_user)
      end
    end

    def authorize_bulk_import_ideas
      authorize :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end
  end
end
