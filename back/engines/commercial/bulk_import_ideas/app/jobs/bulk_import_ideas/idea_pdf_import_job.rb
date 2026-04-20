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
    end

    def handle_error(error)
      case error
      when *RETRYABLE_ERRORS
        return super if error_count <= maximum_retry_count
      end

      SideFxBulkImportService.new.after_failure(import_user, phase, 'idea', 'pdf', error.to_s)

      remaining = unprocessed_files_count
      track_progress(remaining, remaining) if remaining > 0
      complete_if_done!
      ErrorReporter.report(error, extra: { phase_id: phase&.id })
      expire
    end

    private

    def unprocessed_files_count
      arguments[0].count { |file| !IdeaImport.exists?(file_id: file.id) } # arguments[0] is idea_import_files
    end

    def import_user
      arguments[1]
    end

    def phase
      arguments[3]
    end

    # Required by Jobs::TrackableJob
    def job_tracking_context
      phase
    end
  end
end
