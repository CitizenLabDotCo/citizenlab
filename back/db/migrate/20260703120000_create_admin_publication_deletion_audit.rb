# frozen_string_literal: true

# Diagnostic instrumentation for orphaned admin_publications.
#
# We keep finding Project rows whose admin_publication row has been deleted
# (Project.where.missing(:admin_publication)), with no code path in the repo
# that produces it and nothing in the activity log. This captures the NEXT
# occurrence at the database layer, so it catches deletions from ANY source,
# including raw SQL / console / rake that bypasses ActiveRecord callbacks.
#
# The trigger is a DEFERRABLE constraint trigger: it runs at COMMIT, after the
# whole transaction has settled, and only records a row when the deleted
# admin_publication's publication (Project or Folder) STILL EXISTS. That
# cleanly excludes legitimate cascades (Project#destroy / Folder#destroy, where
# the publication is deleted in the same transaction) and records only true
# orphaning.
#
# Audit-only: it never raises, so it cannot break any operation.
class CreateAdminPublicationDeletionAudit < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      create_table :admin_publication_deletion_audits, id: :uuid do |t|
        t.string  :tenant_schema
        t.string  :tenant_host
        t.uuid    :admin_publication_id, null: false
        t.uuid    :publication_id
        t.string  :publication_type
        t.uuid    :parent_id
        t.integer :lft
        t.integer :rgt
        t.integer :ordering
        t.string  :publication_status
        t.datetime :deleted_at
        t.string  :db_user
        t.string  :application_name
        t.column  :client_addr, :inet
        t.integer :backend_pid
        t.bigint  :transaction_id
        t.text    :query
        t.datetime :reported_at # set by the forwarder once pushed to Sentry
        t.timestamps
      end

      execute <<~SQL
        CREATE OR REPLACE FUNCTION log_orphaned_admin_publication() RETURNS trigger
        LANGUAGE plpgsql AS $function$
        DECLARE
          publication_exists boolean := false;
          pub_table text;
        BEGIN
          IF OLD.publication_type = 'Project' THEN
            pub_table := 'projects';
          ELSIF OLD.publication_type = 'ProjectFolders::Folder' THEN
            pub_table := 'project_folders_folders';
          ELSE
            RETURN NULL;
          END IF;

          -- Resolve tables in the trigger's OWN schema, so the check is correct
          -- regardless of the deleting session's search_path (raw SQL included).
          EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I.%I WHERE id = $1)', TG_TABLE_SCHEMA, pub_table)
            INTO publication_exists
            USING OLD.publication_id;

          -- Publication gone too => legitimate cascade. Only log real orphans.
          IF NOT publication_exists THEN
            RETURN NULL;
          END IF;

          EXECUTE format(
            'INSERT INTO %I.admin_publication_deletion_audits
               (id, tenant_schema, tenant_host, admin_publication_id, publication_id,
                publication_type, parent_id, lft, rgt, ordering, publication_status,
                deleted_at, db_user, application_name, client_addr, backend_pid,
                transaction_id, query, created_at, updated_at)
             VALUES (gen_random_uuid(), $9, $10, $1, $2, $3, $4, $5, $6, $7, $8,
                     clock_timestamp(), current_user,
                     current_setting(''application_name'', true), inet_client_addr(),
                     pg_backend_pid(), txid_current(), current_query(),
                     clock_timestamp(), clock_timestamp())',
            TG_TABLE_SCHEMA)
            USING OLD.id, OLD.publication_id, OLD.publication_type, OLD.parent_id,
                  OLD.lft, OLD.rgt, OLD.ordering, OLD.publication_status,
                  TG_TABLE_SCHEMA, replace(TG_TABLE_SCHEMA, '_', '.');

          RETURN NULL;
        EXCEPTION
          WHEN OTHERS THEN
            -- Auditing must never break a legitimate deletion. If anything in
            -- this trigger fails (missing table in a schema, unexpected mismatch,
            -- etc.), silently drop the audit and allow the delete to proceed.
            RETURN NULL;
        END;
        $function$;
      SQL

      execute <<~SQL.squish
        CREATE CONSTRAINT TRIGGER audit_orphaned_admin_publication
        AFTER DELETE ON admin_publications
        DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW
        EXECUTE FUNCTION log_orphaned_admin_publication();
      SQL
    end
  end

  def down
    safety_assured do
      execute 'DROP TRIGGER IF EXISTS audit_orphaned_admin_publication ON admin_publications;'
      execute 'DROP FUNCTION IF EXISTS log_orphaned_admin_publication();'
      drop_table :admin_publication_deletion_audits
    end
  end
end
