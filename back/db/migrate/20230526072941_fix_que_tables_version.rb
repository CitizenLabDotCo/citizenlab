# frozen_string_literal: true

# This migration fixes the version of the Que tables for development and test
# environments. The migration 'UpdateQueTablesToVersion5' ran a custom/modified version
# of the que migration in those environments instead of using:
#   Que.migrate!(5)
# which would have bumped the version in the database after running the migration. As a
# result, the version of the Que tables in the development and test environments stayed
# at 4 instead of being bumped to 5.
class FixQueTablesVersion < ActiveRecord::Migration[6.1]
  def up
    return unless Rails.env.development? || Rails.env.test?
    return unless Que::Migrations.db_version == 4
    raise <<~MSG.squish unless migration_context.get_all_versions.include?(20230517145937)
      The migration 'FixQueTablesVersion' must be run after the migration
      'UpdateQueTablesToVersion5' (20230517145937), as it fixes errors introduced by
      that migration.
    MSG

    Que::Migrations.set_db_version(5)
  end

  private

  def migration_context
    migration_paths = ActiveRecord::Migrator.migrations_paths
    schema_migration = ActiveRecord::Base.connection.schema_migration
    ActiveRecord::MigrationContext.new(migration_paths, schema_migration)
  end
end

