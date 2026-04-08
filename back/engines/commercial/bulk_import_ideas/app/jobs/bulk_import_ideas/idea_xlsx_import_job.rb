# frozen_string_literal: true

module BulkImportIdeas
  class IdeaXlsxImportJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 60
    perform_retries false

    def run(idea_import_files, import_user, locale, phase, personal_data_enabled, first_idea_index)
      file_parser = Parsers::IdeaXlsxFileParser.new(import_user, locale, phase.id, personal_data_enabled)
      import_service = Importers::IdeaImporter.new(import_user, locale)

      idea_rows = []
      idea_import_files.each do |file|
        idea_rows += file_parser.parse_rows file
      end

      ideas = import_service.import(idea_rows)
      users = import_service.imported_users

      SideFxBulkImportService.new.after_success(import_user, phase, 'idea', 'xlsx', ideas, users)
      track_progress_and_complete!
    rescue StandardError => e
      e.params[:row] += first_idea_index if e.instance_of?(BulkImportIdeas::Error) && e.params[:row]
      SideFxBulkImportService.new.after_failure(import_user, phase, 'idea', 'xlsx', e.to_s)
      track_progress_and_complete!
      raise e
    end

    private

    def job_tracking_context
      arguments[3] # phase
    end
  end
end
