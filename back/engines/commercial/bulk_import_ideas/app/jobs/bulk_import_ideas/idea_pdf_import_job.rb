# frozen_string_literal: true

module BulkImportIdeas
  class IdeaPdfImportJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 60
    perform_retries false

    def run(idea_import_files, import_user, locale, phase, personal_data_enabled, first_idea_index)
      file_parser = Parsers::IdeaPdfFileParser.new(import_user, locale, phase.id, personal_data_enabled)
      import_service = Importers::IdeaImporter.new(import_user, locale)

      files_processed = 0
      all_ideas = []
      idea_import_files.each do |file|
        idea_rows = file_parser.parse_rows file
        all_ideas += import_service.import(idea_rows)
        files_processed += 1
        track_progress(1)
      end

      SideFxBulkImportService.new.after_success(import_user, phase, 'idea', 'pdf', all_ideas, import_service.imported_users)
      complete_if_done!
    rescue StandardError => e
      e.params[:row] += first_idea_index if e.instance_of?(BulkImportIdeas::Error) && e.params[:row]
      SideFxBulkImportService.new.after_failure(import_user, phase, 'idea', 'pdf', e.to_s)
      remaining = idea_import_files.count - files_processed
      track_progress_and_complete!(remaining, remaining)
      raise e
    end

    private

    def job_tracking_context
      arguments[3] # phase
    end
  end
end
