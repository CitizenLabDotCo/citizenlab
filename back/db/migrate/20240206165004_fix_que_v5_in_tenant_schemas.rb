# frozen_string_literal: true

# We reinstall Que from scratch in all the tenant schemas (not the `public` schema). This
# is necessary because Que migrations did not play well with Apartment and did not run
# properly for all schemas. This created a bunch of inconsistencies across the different
# schemas. Currently, we have the following situation on production environments:
# - Que tables and other DB artifacts are simply missing altogether in some schemas.
# - Some schemas have version 4 of Que tables, while others have version 5.
# - The DB version of Que is sometimes incorrect (e.g., version is 4, but the DB objects
#   are actually from version 5).
# - Luckily, it seems that the migrations ran properly for the public schema.
#
# In practice, Que jobs are only stored in the `public` schema, so for the most part these
# inconsistencies are inconsequential, but they are confusing and could lead to issues
# difficult to debug in the future.
#
# The problem when using Que jointly with Apartment is that Apartment breaks assumptions
# of the `Que.db_version` method which is used by Que to infer the current version of its
# DB artifacts. We patched it in order to take into account the fact that Apartment
# replicates the tables across the schemas. See {GemExtensions::Que::Migrations} for more
# information.
class FixQueV5InTenantSchemas < ActiveRecord::Migration[7.0]
  def up
    current_schema = Apartment::Tenant.current
    return if current_schema == 'public'

    uninstall_que!(current_schema)
    Que.migrate!(version: 5)
  end

  private

  # Ad hoc script to remove Que from a specific schema. Indeed,
  #   Que.migrate!(version: 0)
  # fails because Que was not properly installed in some schemas.
  def uninstall_que!(schema_name)
    qualify = lambda do |table|
      ActiveRecord::Base.connection.quote_table_name("#{schema_name}.#{table}")
    end

    ActiveRecord::Base.connection.execute <<~SQL.squish
      DROP TABLE IF EXISTS #{qualify.call('que_jobs')} CASCADE;
      DROP TABLE IF EXISTS #{qualify.call('que_lockers')} CASCADE;
      DROP TABLE IF EXISTS #{qualify.call('que_values')} CASCADE;

      DROP SEQUENCE IF EXISTS #{qualify.call('que_jobs_id_seq')} CASCADE;

      DROP FUNCTION IF EXISTS #{qualify.call('que_determine_job_state')};
      DROP FUNCTION IF EXISTS #{qualify.call('que_job_notify')};
      DROP FUNCTION IF EXISTS #{qualify.call('que_state_notify')};
      DROP FUNCTION IF EXISTS #{qualify.call('que_validate_tags')};
    SQL
  end
end
