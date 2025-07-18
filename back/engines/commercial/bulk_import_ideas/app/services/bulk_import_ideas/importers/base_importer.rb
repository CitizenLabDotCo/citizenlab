# frozen_string_literal: true

module BulkImportIdeas::Importers
  class BaseImporter
    def initialize(current_user, locale, create_empty_users: true)
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      @import_user = current_user
      @imported_users = []
      @create_empty_users = create_empty_users # Empty users are needed for the import FE to be able to manually update missing user details
    end

    attr_reader :imported_users

    def import(rows)
      raise NotImplementedError, 'This method is not yet implemented'
    end
  end
end
