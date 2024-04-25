# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportJob < ApplicationJob
    self.priority = 60

    CONSTANTIZER = {
      'xlsx' => {
        exporter_class: Exporters::IdeaXlsxFormExporter
      },
      'pdf' => {
        exporter_class: Exporters::IdeaPdfFormExporter
      }
    }

    def run(format, files, import_user, locale, phase, personal_data_enabled)
      file_parser = CONSTANTIZER.fetch(format)[:parser_class].new(import_user, locale, phase.id, personal_data_enabled)
      import_service = BulkImportIdeas::Importers::IdeaImporter.new(import_user, locale)

      idea_rows = []
      files.each do |file|
        idea_rows += file_parser.parse_rows file
      end

      ideas = import_service.import(idea_rows)
      users = import_service.imported_users

      SideFxBulkImportService.new.after_success(import_user, phase, 'idea', format, ideas, users)
    end
  end
end
