# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas, only: %i[bulk_create example_xlsx draft_ideas]

    # NOTE: PDF version only works for a project endpoint
    def bulk_create
      file = bulk_create_params[:pdf] || bulk_create_params[:xlsx]
      ideas = import_ideas_service.import_file file
      users = import_ideas_service.imported_users
      sidefx.after_success current_user, @project, ideas, users

      render json: ::WebApi::V1::IdeaSerializer.new(
        ideas,
        params: jsonapi_serializer_params,
        include: %i[author idea_import]
      ).serializable_hash, status: :created
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user, @project
      render json: { errors: { file: [{ error: e.key, **e.params }] } }, status: :unprocessable_entity
    end

    def example_xlsx
      xlsx = import_ideas_service.generate_example_xlsx
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end

    def draft_ideas
      creation_phase_id = nil
      if import_scope == :phase
        phase = Phase.find(params[:id])
        creation_phase_id = phase&.native_survey? ? phase.id : nil
      end
      ideas = Idea.draft.where(project_id: @project.id, creation_phase_id: creation_phase_id)

      render json: linked_json(
        paginate(ideas),
        ::WebApi::V1::IdeaSerializer,
        include: %i[author idea_import],
        params: jsonapi_serializer_params
      )
    end

    # Show the metadata of a single imported idea
    def show_idea_import
      idea_import = IdeaImport.find(params[:id])
      authorize idea_import

      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    def show_idea_import_file
      idea_import_file = IdeaImportFile.find(params[:id])
      authorize idea_import_file.project || :'bulk_import_ideas/import_ideas'

      send_data URI.open(idea_import_file.file_content_url).read, type: 'application/octet-stream'
    end

    private

    def bulk_create_params
      params
        .require(:import_ideas)
        .permit(%i[xlsx pdf locale phase_id personal_data])
    end

    def import_ideas_service
      locale = params[:import_ideas] ? bulk_create_params[:locale] : current_user.locale
      personal_data_enabled = params[:import_ideas] ? bulk_create_params[:personal_data] || false : false
      @import_ideas_service ||= if import_scope == :project
        phase_id = params[:import_ideas] ? bulk_create_params[:phase_id] : nil
        ImportProjectIdeasService.new(current_user, @project.id, locale, phase_id, personal_data_enabled)
      elsif import_scope == :phase
        phase_id = params[:id]
        ImportProjectIdeasService.new(current_user, @project.id, locale, phase_id, personal_data_enabled)
      else
        ImportGlobalIdeasService.new(current_user)
      end
    end

    def import_scope
      return :project if request.path.include? 'projects'
      return :phase if request.path.include? 'phases'

      :global
    end

    def authorize_bulk_import_ideas
      @project = nil
      if import_scope == :project
        @project = Project.find(params[:id])
      elsif import_scope == :phase
        @project = Phase.find(params[:id]).project
      end

      authorize @project || :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end
  end
end
