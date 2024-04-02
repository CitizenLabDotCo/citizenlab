# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::ImportIdeasController < ApplicationController
    before_action :authorize_bulk_import_ideas, only: %i[bulk_create example_xlsx to_pdf draft_ideas approve_all]

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

    def to_pdf
      locale = params[:locale] || current_user.locale
      personal_data_enabled = params[:personal_data] == 'true'
      phase = Phase.find(params[:id])

      if phase
        custom_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(phase).custom_form).enabled_fields_with_other_options
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

    def approve_all
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
      render json: linked_json(
        paginate(imported_draft_ideas),
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
        .permit(%i[xlsx pdf locale personal_data])
    end

    def import_ideas_service
      locale = params[:import_ideas] ? bulk_create_params[:locale] : current_user.locale
      personal_data_enabled = params[:import_ideas] ? bulk_create_params[:personal_data] || false : false
      phase_id = params[:id]
      @import_ideas_service = ImportProjectIdeasService.new(current_user, @project.id, locale, phase_id, personal_data_enabled)
    end

    def authorize_bulk_import_ideas
      @project = Phase.find(params[:id]).project
      authorize @project || :'bulk_import_ideas/import_ideas'
    end

    def sidefx
      @sidefx ||= SideFxImportIdeasService.new
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
