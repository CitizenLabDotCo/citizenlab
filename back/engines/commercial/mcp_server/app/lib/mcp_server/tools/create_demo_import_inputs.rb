# frozen_string_literal: true

class McpServer::Tools::CreateDemoImportInputs < McpServer::BaseTool
  MAX_INPUTS_PER_CALL = 50
  # Participation methods whose phases use the Input Importer / FormSync UI.
  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'create_demo_import_inputs'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: true # Fetches each scan_pdf_url from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Seeds DRAFT inputs that appear in the admin Input Importer / FormSync review queue, each
      optionally linked to a scanned-form PDF, so you can demo the import-review flow without a real
      scan. For native_survey or ideation phases only. Only available on demo and trial platforms,
      and the input_importer feature must be enabled. Each input gets a fake demo author; pass
      custom_field_values (see get_form_fields) to pre-fill answers — supply the form's required
      fields if the demo will approve the draft. scan_pdf_url must be a publicly reachable PDF
      (images are not accepted); a URL ending in .pdf is safest. Max #{MAX_INPUTS_PER_CALL} per call.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the native_survey or ideation phase.' },
        inputs: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_INPUTS_PER_CALL,
          items: {
            type: 'object',
            properties: {
              title_multiloc: { **multiloc_schema, description: 'Input title (optional for drafts).' },
              body_multiloc: { **multiloc_schema, description: 'Input body HTML (optional for drafts).' },
              custom_field_values: {
                type: 'object',
                description: 'Answers keyed by form field key (see get_form_fields). Supply the ' \
                             'required fields if the draft should be approvable.'
              },
              scan_pdf_url: {
                type: 'string',
                format: 'uri',
                description: 'Public URL of a PDF scan to attach (shown in the importer preview). ' \
                             'Must be a reachable PDF; omit for no scan.'
              }
            },
            additionalProperties: false
          }
        }
      },
      required: %w[phase_id inputs],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo import inputs can only be created on demo and trial platforms.'
    FEATURE_OFF_MESSAGE = 'The input_importer feature must be enabled to view imported inputs; enable it first.'

    # A scan download/validation failure for one input; reported per-input, nothing else saved.
    ScanError = Class.new(StandardError)
    # Raised by CarrierWave when the remote fetch fails or the file is not an allowed type (PDF).
    SCAN_DOWNLOAD_ERRORS = [CarrierWave::DownloadError, CarrierWave::IntegrityError, CarrierWave::ProcessingError].freeze

    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?
      return error(FEATURE_OFF_MESSAGE) unless AppConfiguration.instance.feature_activated?('input_importer')

      unless SUPPORTED_METHODS.include?(phase.pmethod.class.method_str)
        return error("Input importing is only supported for #{SUPPORTED_METHODS.join(' and ')} phases.")
      end

      ceiling = ceiling_error(phase.project)
      return ceiling if ceiling

      # Build and validate every idea before any writes, so a bad input fails the whole call
      # before we create anything (partial success is only possible on a scan download, below).
      ideas = params[:inputs].map { |attributes| build_idea(phase, attributes) }
      ideas.each { |idea| authorize(idea, :create?) }
      invalid = ideas.each_with_index.filter_map do |idea, index|
        { index:, errors: record_errors(idea) } if idea.invalid?
      end
      return error('Validation failed:', structured: { errors: invalid }) if invalid.any?

      persist(phase, ideas)
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def persist(phase, ideas)
      created = []
      scan_errors = []

      params[:inputs].zip(ideas).each_with_index do |(attributes, idea), index|
        # Save the scan first, OUTSIDE the transaction: the remote download happens here, so it
        # never holds a DB connection, and a bad URL aborts just this input before any idea exists.
        begin
          scan = save_scan(phase.project, attributes[:scan_pdf_url])
        rescue ScanError => e
          scan_errors << { index:, error: e.message }
          next
        end

        ActiveRecord::Base.transaction do
          idea.author.save!
          idea.save!
          BulkImportIdeas::IdeaImport.create!(
            idea:, file: scan, import_user: current_user, user_created: true, locale: idea.author.locale
          )
        end
        created << idea.id
      end

      response(
        "Created #{created.size} draft import inputs in phase #{phase.id}",
        structured: { idea_ids: created, scan_errors: }
      )
    end

    def build_idea(phase, attributes)
      pmethod = phase.pmethod
      idea = Idea.new(
        project: phase.project,
        phases: [phase],
        creation_phase: pmethod.transitive? ? nil : phase,
        publication_status: 'draft',
        author: McpServer::DemoData.build_author(Time.zone.now),
        title_multiloc: attributes[:title_multiloc],
        body_multiloc: attributes[:body_multiloc]
      )
      CustomFieldValuesTransitionService.new.assign(idea, attributes[:custom_field_values])
      # Titleless survey drafts have no slug source; mirror the real importer's fallback.
      idea.slug ||= SecureRandom.uuid unless idea.valid?
      idea
    end

    # Saves the scanned-form file (downloads the remote PDF). Returns nil when no url is given;
    # raises ScanError on a failed download or a non-PDF file so the caller can skip just this input.
    def save_scan(project, scan_pdf_url)
      return if scan_pdf_url.blank?

      BulkImportIdeas::IdeaImportFile.create!(
        project:,
        name: 'scan.pdf',
        import_type: 'pdf',
        # name: must be set explicitly too — file_by_url= sets the file + remote url but not name.
        file_by_url: { name: 'scan.pdf', url: scan_pdf_url }
      )
    rescue *SCAN_DOWNLOAD_ERRORS, ActiveRecord::RecordInvalid => e
      raise ScanError, "Scan not attached: #{e.message}. " \
                       'scan_pdf_url must be a publicly reachable PDF (a URL ending in .pdf is safest).'
    end

    def ceiling_error(project)
      requested = params[:inputs].size

      input_count = McpServer::DemoData.demo_input_count(project)
      if input_count + requested > McpServer::DemoData::MAX_INPUTS_PER_PROJECT
        return error("Demo input ceiling reached: this project has #{input_count} demo inputs " \
                     "of max #{McpServer::DemoData::MAX_INPUTS_PER_PROJECT}. Do not create more.")
      end

      user_ceiling_message = McpServer::DemoData.user_ceiling_error_message(requested)
      error(user_ceiling_message) if user_ceiling_message
    end
  end
end
