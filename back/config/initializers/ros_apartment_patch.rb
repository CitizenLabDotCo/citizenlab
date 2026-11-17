require 'apartment/adapters/postgresql_adapter'

# Memoize pg_dump output so we only pay for it once per worker process.
# Apartment clones the public schema into each new tenant by shelling out to
# pg_dump to capture the DDL (CREATE TABLE/INDEX/FUNCTION/...) as a SQL string,
# which it then rewrites and executes against the new schema. The shell-out
# takes ~10 s per call and is the dominant cost of tenant creation. The dump
# only changes when migrations run, so we key the cache on the schema version
# to invalidate automatically if someone runs db:migrate against a long-lived
# process.
module Apartment
  module Adapters
    module MemoizedPgDumpSchema
      @cache = {}

      def self.cache
        @cache
      end

      private

      def pg_dump_schema
        version = ActiveRecord::Migrator.current_version
        MemoizedPgDumpSchema.cache[version] ||= begin
          MemoizedPgDumpSchema.cache.clear
          super
        end
      end
    end

    PostgresqlSchemaFromSqlAdapter.prepend(MemoizedPgDumpSchema)
  end
end
