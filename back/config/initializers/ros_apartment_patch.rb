require 'apartment/adapters/postgresql_adapter'

# This patch is necessary to ensure that the `PSQL_DUMP_BLACKLISTED_STATEMENTS`
# includes \unrestrict and \restrict

module Apartment
  module Adapters
    class PostgresqlSchemaFromSqlAdapter
      # Use class_eval to redefine the constant within the class.
      class_eval do
        remove_const(:PSQL_DUMP_BLACKLISTED_STATEMENTS)
        const_set(:PSQL_DUMP_BLACKLISTED_STATEMENTS, [
          /SET search_path/i,
          /SET lock_timeout/i,
          /SET row_security/i,
          /SET idle_in_transaction_session_timeout/i,
          /SET default_table_access_method/i,
          /CREATE SCHEMA public/i,
          /COMMENT ON SCHEMA public/i,
          /\\unrestrict/i,
          /\\restrict/i
        ].freeze)
      end
    end
  end
end
