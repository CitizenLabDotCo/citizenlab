# frozen_string_literal: true

module BulkImportIdeas::Importers
  class BaseImporter
    def initialize(current_user, locale)
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      @import_user = current_user
      @imported_users = []
    end

    attr_reader :imported_users

    def import(rows)
      raise NotImplementedError, 'This method is not yet implemented'
    end
  end
end
