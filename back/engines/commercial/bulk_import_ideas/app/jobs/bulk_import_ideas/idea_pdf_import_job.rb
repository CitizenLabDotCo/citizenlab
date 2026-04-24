# frozen_string_literal: true

module BulkImportIdeas
  class IdeaPdfImportJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 60

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

    private

    RETRYABLE_ERRORS = [
      RubyLLM::RateLimitError,
      RubyLLM::OverloadedError,
      RubyLLM::ServerError,
      RubyLLM::ServiceUnavailableError
    ].freeze

    def handle_error(error)
      case error
      when *RETRYABLE_ERRORS then super
      else expire
      end
    end

    def expire
      finalize_failure(idea_import_files, import_user, phase, last_error)
      super
    end

    def last_error
      que_target.que_error
    end

    def finalize_failure(idea_files, user, phase, error)
      SideFxBulkImportService.new.after_failure(user, phase, 'idea', 'pdf', error.to_s)

      remaining = count_missing_imports(idea_files)
      track_progress(remaining, remaining) if remaining > 0
      complete_if_done!
    end

    def count_missing_imports(idea_files)
      file_ids = idea_files.map(&:id)
      file_ids.size - IdeaImport.where(file_id: file_ids).count
    end

    def idea_import_files
      arguments[0]
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
