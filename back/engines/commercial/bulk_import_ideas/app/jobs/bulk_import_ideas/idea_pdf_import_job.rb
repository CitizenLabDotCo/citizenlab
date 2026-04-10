# frozen_string_literal: true

module BulkImportIdeas
  class IdeaPdfImportJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 60
    perform_retries true

    RETRYABLE_ERRORS = [
      RubyLLM::RateLimitError,
      RubyLLM::OverloadedError,
      RubyLLM::ServerError,
      RubyLLM::ServiceUnavailableError
    ].freeze

    def run(idea_import_files, import_user, locale, phase, personal_data_enabled, _first_idea_index)
      file_parser = Parsers::IdeaPdfFileParser.new(import_user, locale, phase.id, personal_data_enabled)
      import_service = Importers::IdeaImporter.new(import_user, locale)

      all_ideas = []
      idea_import_files.each do |file|
        next if IdeaImport.exists?(file_id: file.id)

        idea_rows = file_parser.parse_rows(file)
        all_ideas += import_service.import(idea_rows)
        track_progress(1)
      end

      SideFxBulkImportService.new.after_success(import_user, phase, 'idea', 'pdf', all_ideas, import_service.imported_users) if all_ideas.any?
      complete_if_done!
    rescue StandardError => e
      SideFxBulkImportService.new.after_failure(import_user, phase, 'idea', 'pdf', e.to_s)
      raise e
    end

    def handle_error(error)
      if retryable?(error) && error_count <= resolve_que_setting(:maximum_retry_count)
        super
      else
        remaining = unprocessed_files_count
        track_progress_and_complete!(remaining, remaining) if remaining > 0
        ErrorReporter.report(error, extra: { phase_id: arguments[3]&.id })
        expire
      end
    end

    private

    def retryable?(error)
      RETRYABLE_ERRORS.any? { |klass| error.is_a?(klass) }
    end

    def unprocessed_files_count
      arguments[0].count { |file| !IdeaImport.exists?(file_id: file.id) }
    end

    def job_tracking_context
      arguments[3] # phase
    end
  end
end
