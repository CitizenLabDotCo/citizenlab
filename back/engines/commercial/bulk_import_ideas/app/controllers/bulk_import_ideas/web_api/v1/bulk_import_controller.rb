# frozen_string_literal: true

module BulkImportIdeas
  class WebApi::V1::BulkImportController < ApplicationController
    skip_before_action :authenticate_user, only: %i[export_form]
    before_action :authorize_bulk_import_ideas, only: %i[bulk_create_async export_form draft_records approve_all]

    CONSTANTIZER = {
      'idea' => {
        serializer_class: ::WebApi::V1::IdeaSerializer,
        'xlsx' => {
          exporter_class: Exporters::IdeaXlsxFormExporter,
          parser_class: Parsers::IdeaXlsxFileParser
        },
        'html' => {
          exporter_class: Exporters::IdeaHtmlFormExporter,
          parser_class: nil # Not implemented for importing
        },
        'pdf' => {
          exporter_class: Exporters::IdeaPdfFormExporter,
          parser_class: Parsers::IdeaPdfFileParser
        },
        # The following classes are now for legacy support of the prawn based pdf import/export
        'legacy_pdf' => {
          exporter_class: Legacy::IdeaPdfFormExporter,
          parser_class: Legacy::IdeaPdfFileParser
        }
      }
    }

    def bulk_create_async
      send_not_found unless supported_model? && supported_format?

      file = bulk_create_params[:file]
      job_ids = file_parser_service.parse_file_async file

      sidefx.after_success current_user, @phase, params[:model], params[:format], [], []

      render json: ::WebApi::V1::BackgroundJobSerializer.new(
        QueJob.all_by_job_ids(job_ids),
        params: jsonapi_serializer_params
      ).serializable_hash
    rescue BulkImportIdeas::Error => e
      sidefx.after_failure current_user, @phase, params[:model], params[:format], e.key
      render json: { errors: { file: [{ error: e.key, **e.params }] } }, status: :unprocessable_entity
    end

    def export_form
      send_not_found and return unless supported_model? && supported_format?

      locale = params[:locale] || current_user.locale || Locale.default
      personal_data_enabled = params[:personal_data] == 'true'

      service = form_exporter_service.new(@phase, locale, personal_data_enabled)
      file = service.export

      send_not_found and return unless file

      # If the export is HTML-based, we are not sending a binary file so need to render differently
      render html: file and return if service.format == 'html'

      send_data file, type: service.mime_type, filename: service.filename
    end

    def approve_all
      send_not_found unless supported_model?

      records = imported_draft_records
      approved = 0
      not_approved = 0
      side_fx_idea_service = SideFxIdeaService.new
      records.each do |record|
        if record.update(publication_status: 'published')
          approved += 1
          side_fx_idea_service.after_import(record, current_user)
        else
          not_approved += 1
        end
      end

      render json: raw_json({ approved:, not_approved: })
    end

    def draft_records
      send_not_found unless supported_model?

      render json: linked_json(
        paginate(imported_draft_records),
        serializer,
        include: %i[author idea_import],
        params: jsonapi_serializer_params
      )
    end

    # Show the metadata of a single imported idea
    # NOTE: When other model types (eg comments) are supported, IdeaImport & IdeaImportFile will need to be made polymorphic
    def show_idea_import
      idea_import = IdeaImport.find(params[:id])
      authorize idea_import.idea

      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    def show_idea_import_file
      idea_import_file = IdeaImportFile.find(params[:id])
      authorize idea_import_file.project

      send_data URI.open(idea_import_file.file_content_url).read, type: 'application/octet-stream'
    end

    private

    def bulk_create_params
      params
        .require(:import)
        .permit(%i[file locale personal_data legacy_pdf])
    end

    def authorize_bulk_import_ideas
      @phase = Phase.find(params[:id])
      if @phase
        @project = @phase.project
        authorize @project
      else
        send_not_found
      end
    end

    def sidefx
      @sidefx ||= SideFxBulkImportService.new
    end

    def file_parser_service
      locale = params[:import] ? bulk_create_params[:locale] : current_user.locale
      personal_data_enabled = params[:import] ? bulk_create_params[:personal_data] || false : false
      phase_id = params[:id]

      service = find_class(:parser_class)
      @file_parser_service ||= service.new(current_user, locale, phase_id, personal_data_enabled)
    end

    def form_exporter_service
      find_class(:exporter_class)
    end

    # Find the class for the given type (exporter_class, parser_class, serializer_class)
    def find_class(class_type)
      model = params[:model]
      format = params[:format]

      return CONSTANTIZER.fetch(model)[class_type] if class_type == :serializer_class

      format = 'legacy_pdf' if format == 'pdf' && use_legacy_pdf?

      CONSTANTIZER.fetch(model).fetch(format)[class_type]
    end

    # Use legacy pdf if the html_pdfs feature flag is off or ?legacy=true in importer url
    def use_legacy_pdf?
      legacy = params[:import] ? !!bulk_create_params[:legacy_pdf] : false # Allows backdoor access to the old pdf format whilst feature flag is on
      !AppConfiguration.instance.settings.dig('html_pdfs', 'enabled') || legacy
    end

    def serializer
      find_class(:serializer_class)
    end

    def supported_model?
      CONSTANTIZER.key?(params[:model])
    end

    def supported_format?
      CONSTANTIZER.fetch(params[:model]).key?(params[:format])
    end

    def imported_draft_records
      if params[:model] == 'idea'
        phase = Phase.find(params[:id])
        creation_phase_id = phase.pmethod.transitive? ? nil : phase.id
        Idea
          .draft
          .in_phase(phase)
          .joins(:idea_import)
          .where(project_id: @project.id, creation_phase_id: creation_phase_id)
          .includes(%i[project idea_import author ideas_phases phases topics idea_images])
          .includes([idea_import: :file])
      end
    end
  end
end
