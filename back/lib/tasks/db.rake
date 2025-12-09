# frozen_string_literal: true

namespace :db do
  desc 'Run db:migrate only if there are pending migrations.'
  task migrate_if_pending: :environment do
    Rails.logger.info 'db:migrate_if_pending started'
    migration_versions = ActiveRecord::Base.connection_pool.migration_context.migrations.to_set(&:version)

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
      Rails.logger.info 'Skipping db:migrate as there are no pending migrations.'
    else
      Rake::Task['db:migrate'].invoke
    end
    Rails.logger.info 'db:migrate_if_pending finished'
  end

  desc 'Postprocess db/structure.sql after db:schema:dump.'
  task postprocess_structure_sql: :environment do
    structure_file = 'db/structure.sql'
    schema = File.read(structure_file)
    processed_schema = CitizenLab::Database::SchemaPostprocessor.new(schema).process
    File.write(structure_file, processed_schema)
  end

  Rake::Task['db:schema:dump'].enhance do
    Rake::Task['db:postprocess_structure_sql'].invoke
  end
end
