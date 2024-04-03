# frozen_string_literal: true

module BulkImportIdeas
  class Error < StandardError
    def initialize(key, params = {})
      super()
      @key = key
      @params = params
    end

    attr_reader :key, :params
  end

  class BaseImporter
    def initialize(current_user)
      @locale = AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      # @all_topics = Topic.all - TODO: JS - can we still import topics?
      @import_user = current_user
      @imported_users = []
    end

    attr_reader :imported_users
  end
end
