# frozen_string_literal: true

module BulkImportIdeas
  class UserImportJob < ApplicationJob
    self.priority = 60
    perform_retries false

    def run(users, user_custom_fields, projects, import_id, import_user, locale)
      locale = locale.to_sym # hashkeys get converted to symbols by the serializer

      # No need to try and import users if there are none
      if users.any?
        importer = BulkImportIdeas::Importers::ProjectImporter.new(import_user, locale)
        importer.import_users(users, user_custom_fields)
        log = importer.import_log

        BulkImportIdeas::ProjectImport.create!(
          project: nil,
          import_user: import_user,
          import_id: import_id,
          log: log,
          locale: locale,
          import_type: 'user'
        )
      end

      # Now create one job for each project
      projects.each do |project_data|
        BulkImportIdeas::ProjectImportJob.perform_later(project_data, import_id, @import_user, @locale)
      end
    end
  end
end
