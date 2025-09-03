# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportJob < ApplicationJob
    self.priority = 60
    perform_retries false

    def run(file_parser_class, idea_import_files, import_user, locale, phase, personal_data_enabled, first_idea_index)
      file_parser = file_parser_class.new(import_user, locale, phase.id, personal_data_enabled)
      import_service = BulkImportIdeas::Importers::IdeaImporter.new(import_user, locale)

      idea_rows = []
      idea_import_files.each do |file|
        idea_rows += file_parser.parse_rows file
      end

      # Correct jumbled up text fields with GPT if importing PDF
      format = file_parser_class == BulkImportIdeas::Parsers::IdeaXlsxFileParser ? 'xlsx' : 'pdf'
      idea_rows = idea_rows_with_corrected_texts(phase, idea_rows) if format == 'pdf'

      ideas = import_service.import(idea_rows)
      users = import_service.imported_users

      SideFxBulkImportService.new.after_success(import_user, phase, 'idea', format, ideas, users)
    rescue StandardError => e
      e.params[:row] += first_idea_index if e.instance_of?(BulkImportIdeas::Error) && e.params[:row]
      SideFxBulkImportService.new.after_failure(import_user, phase, 'idea', format, e.to_s)
      raise e
    end

    private

    def idea_rows_with_corrected_texts(phase, idea_rows)
      corrector = BulkImportIdeas::Parsers::Pdf::GPTTextCorrector.new(phase, idea_rows)
      corrector.correct
    end
  end
end
