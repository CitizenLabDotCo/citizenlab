# frozen_string_literal: true

module Analytics
  class ApplicationRecord < ActiveRecord::Base
    self.abstract_class = true

    connects_to database: { writing: :analytics, reading: :analytics }

    # Set the schema to the schema that has already been set by Apartment for the main connection
    connection.schema_search_path = ActiveRecord::Base.connection.schema_search_path

    def readonly?
      true
    end
  end
end
