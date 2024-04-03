# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas, only: %i[bulk_create export_form draft_ideas approve_all]

    SUPPORTED_MODELS = ['idea'].freeze
    SUPPORTED_FORMATS = %w[pdf xlsx].freeze

    def bulk_create
      send_not_found unless supported_model? && supported_format?

      format = params[:format].to_sym
      file = bulk_create_params[format] # TODO: JS - just change to 'file'?

      locale = params[:import] ? bulk_create_params[:locale] : current_user.locale
      personal_data_enabled = params[:import] ? bulk_create_params[:personal_data] || false : false
      phase_id = params[:id]
      file_parser = file_parser_service.new(current_user, locale, phase_id, personal_data_enabled)
      import_service = importer_service.new(current_user)

      rows = file_parser.parse_file file

      ideas = import_service.import(rows) # TODO: JS - file not added here
      users = import_service.imported_users

      sidefx.after_success current_user, @project, ideas, users

      render json: serializer.new(
        ideas,
        params: jsonapi_serializer_params,
        include: %i[author idea_import]
      ).serializable_hash, status: :created
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user, @project
      render json: { errors: { file: [{ error: e.key, **e.params }] } }, status: :unprocessable_entity
    end

    def export_form
      send_not_found unless supported_model? && supported_format?

      locale = params[:locale] || current_user.locale
      personal_data_enabled = params[:personal_data] == 'true'

      service = form_exporter_service.new(@phase, locale, personal_data_enabled)
      send_data service.export, type: service.mime_type, filename: service.filename
    end

    def approve_all
      send_not_found unless supported_model?

      ideas = imported_draft_ideas
      approved = 0
      not_approved = 0
      ideas.each do |idea|
        if idea.update(publication_status: 'published')
          approved += 1
        else
          not_approved += 1
        end
      end

      render json: raw_json({ approved: approved, notApproved: not_approved })
    end

    def draft_ideas
      send_not_found unless supported_model?

      render json: linked_json(
        paginate(imported_draft_ideas),
        serializer,
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
      authorize idea_import_file.project || :import

      send_data URI.open(idea_import_file.file_content_url).read, type: 'application/octet-stream'
    end

    private

    def bulk_create_params
      params
        .require(:import)
        .permit(%i[xlsx pdf locale personal_data])
    end

    def authorize_bulk_import_ideas
      @phase = Phase.find(params[:id])
      if @phase
        @project = @phase.project
        authorize @project || :import
      else
        send_not_found
      end
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
    end

    def importer_service
      model = params[:model]
      "BulkImportIdeas::#{model.camelize}Importer".constantize
    end

    def file_parser_service
      model = params[:model]
      format = params[:format]
      "BulkImportIdeas::#{model.camelize}#{format.camelize}FileParser".constantize
    end

    def form_exporter_service
      model = params[:model]
      format = params[:format]
      "BulkImportIdeas::#{model.camelize}#{format.camelize}FormExporter".constantize
    end

    def serializer
      model = params[:model]
      "::WebApi::V1::#{model.camelize}Serializer".constantize
    end

    def supported_model?
      SUPPORTED_MODELS.include?(params[:model])
    end

    def supported_format?
      SUPPORTED_FORMATS.include?(params[:format])
    end

    def imported_draft_ideas
      phase = Phase.find(params[:id])
      creation_phase_id = phase&.native_survey? ? phase.id : nil
      Idea
        .draft
        .in_phase(phase)
        .joins(:idea_import)
        .where(project_id: @project.id, creation_phase_id: creation_phase_id)
    end
  end
end
