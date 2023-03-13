# frozen_string_literal: true

namespace :db do
  desc 'Run db:migrate only if there are pending migrations.'
  task migrate_if_pending: :environment do
    migration_versions = ActiveRecord::Base.connection.migration_context.migrations.to_set(&:version)

    schemas = Tenant.all.map(&:schema_name) + ['public']

    # SQL query that retrieves the list of migrations that have already been executed for each schema.
    sql = schemas
      .map { |schema| %(SELECT "schema_migrations"."version", '#{schema}' AS schema_name FROM "#{schema}"."schema_migrations") }
      .join(' UNION ')

    pending_migrations = ActiveRecord::Base
      .connection.exec_query(sql)
      .group_by { |row| row['schema_name'] }
      .transform_values { |rows| rows.pluck('version').to_set(&:to_i) }
      .transform_values { |run_migrations| migration_versions - run_migrations }

    if pending_migrations.values.all?(&:empty?)
      puts 'Skipping db:migrate as there are no pending migrations.'
    else
      Rake::Task['db:migrate'].invoke
    end
  end
end
