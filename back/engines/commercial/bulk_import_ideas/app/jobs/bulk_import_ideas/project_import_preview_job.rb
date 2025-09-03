# frozen_string_literal: true

module BulkImportIdeas
  class ProjectImportPreviewJob < ApplicationJob
    self.priority = 60
    perform_retries false

    def run(preview_log, import_id, import_user, locale)
      BulkImportIdeas::ProjectImport.create!(
        project: nil,
        import_user: import_user,
        import_id: import_id,
        log: preview_log,
        locale: locale,
        import_type: 'preview'
      )
    end
  end
end
