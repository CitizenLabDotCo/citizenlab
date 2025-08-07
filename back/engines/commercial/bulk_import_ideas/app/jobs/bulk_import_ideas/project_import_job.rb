# frozen_string_literal: true

module BulkImportIdeas
  class ProjectImportJob < ApplicationJob
    self.priority = 60
    perform_retries false

    def run(project_data, import_id, import_user, locale)
      importer = BulkImportIdeas::Importers::ProjectImporter.new(import_user, locale)
      project = importer.import_project(project_data)
      log = importer.import_log

      BulkImportIdeas::ProjectImport.create!(
        project: project,
        import_user: import_user,
        import_id: import_id,
        log: log,
        locale: locale,
        import_type: 'project'
      )
    end
  end
end
