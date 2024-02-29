# frozen_string_literal: true

module GemExtensions
  module Que
    module Migrations
      # This extension adapts Que's migrations to make them compatible with Apartment.
      # The Que database version (an internal version number used by Que to version
      # changes in how it persists jobs) is stored as a comment on the `que_jobs` table.
      # However, the original implementation of `db_version` does not expect the database
      # to contain multiple `que_jobs` tables and, as a result, is returning the version
      # of one of them indeterministically.
      module ClassMethods
        def db_version
          current_schema_name = Apartment::Tenant.current

          result = ::Que.execute <<-SQL.squish
            SELECT relname, description
            FROM pg_class
            LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
            WHERE relname = 'que_jobs'
            AND pg_class.relnamespace = (
              SELECT oid FROM pg_namespace WHERE nspname = '#{current_schema_name}'
            )
          SQL

          if result.size > 1
            raise <<~ERROR.squish
              Unexpected number of que_jobs tables found (schema: #{current_schema_name}).
              Expected 1, got #{result.size}.
            ERROR
          end

          if result.none?
            # No table in the database at all.
            0
          elsif (d = result.first[:description]).nil?
            # There's a table, it was just created before the migration system
            # existed.
            1
          else
            d.to_i
          end
        end
      end
    end
  end
end
