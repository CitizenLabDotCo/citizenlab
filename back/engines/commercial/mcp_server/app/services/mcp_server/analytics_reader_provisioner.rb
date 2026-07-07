# frozen_string_literal: true

module McpServer
  # Provisions the `analytics_reader` Postgres role that backs layer 2 of the
  # reporting-SQL sandbox (see McpServer::SqlSandboxer and the
  # run_reporting_sql_query tool). The role is NOLOGIN: the app connection assumes
  # it per-query via `SET LOCAL ROLE`, so there are no separate credentials.
  #
  # Read scope is exactly the REPORTING_TABLES exposed by GetReportingSqlSchema,
  # granted per tenant schema. Three call sites share this one idempotent service:
  #   - the backfill migration  -> all existing tenants (Apartment runs it per schema);
  #   - finalize_creation        -> each new tenant (the tenant clone strips grants);
  #   - the reprovision rake task -> re-grant after REPORTING_TABLES grows.
  #
  # Requires the running DB user to hold CREATEROLE (true for the dev superuser and
  # the RDS master). On the tenant-creation hot path use .provision_safely, which
  # fails closed (logs) instead of breaking tenant creation when that is missing.
  class AnalyticsReaderProvisioner
    ROLE = 'analytics_reader'

    class << self
      def provision!(schema = Apartment::Tenant.current)
        ensure_role!
        grant!(schema)
      end

      # Tenant-creation-safe variant: a provisioning failure (e.g. the app role
      # lacks CREATEROLE) must never abort tenant creation. The work runs in its
      # own savepoint so a failed statement rolls back to it instead of poisoning
      # the surrounding transaction; the reporting tool then fails closed until
      # the role is provisioned out of band.
      def provision_safely(schema = Apartment::Tenant.current)
        ActiveRecord::Base.transaction(requires_new: true) do
          provision!(schema)
        end
        true
      rescue StandardError => e
        Rails.logger.error("[#{name}] provisioning failed for schema '#{schema}': #{e.message}")
        Sentry.capture_exception(e) if defined?(Sentry)
        false
      end

      # Idempotent and safe under parallel migration threads: the DO block
      # swallows the duplicate-role race rather than raising.
      def ensure_role!
        execute(<<~SQL.squish)
          DO $$ BEGIN
            CREATE ROLE #{ROLE} NOLOGIN;
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        SQL
        # Let the app's login role assume analytics_reader via SET LOCAL ROLE.
        execute("GRANT #{quoted_role} TO CURRENT_USER")
      end

      # Relations missing from the schema are skipped rather than raised on:
      # REPORTING_TABLE_NAMES reflects the newest code, but during a fresh
      # `db:migrate` an older provisioning migration runs before the migrations
      # that create the newer reporting views. Every view-adding change ships
      # its own provision! migration, so skipped grants are always picked up by
      # a later step in the same stream.
      def grant!(schema = Apartment::Tenant.current)
        execute("GRANT USAGE ON SCHEMA #{quote_ident(schema)} TO #{quoted_role}")
        reporting_tables.each do |table|
          next unless relation_exists?(schema, table)

          execute("GRANT SELECT ON #{quote_rel(schema, table)} TO #{quoted_role}")
        end
      end

      # Tears down the role and all its grants across the current database.
      # The role is cluster-global, so this is guarded and safe to call per schema
      # (the first call drops everything; later calls no-op).
      def drop_role!
        return unless role_exists?

        execute("DROP OWNED BY #{quoted_role} CASCADE") # revokes its grants first
        execute("DROP ROLE #{quoted_role}")
      end

      def role_exists?
        connection.select_value("SELECT 1 FROM pg_roles WHERE rolname = #{connection.quote(ROLE)}").present?
      end

      private

      def reporting_tables
        McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLE_NAMES
      end

      def relation_exists?(schema, table)
        connection.select_value(<<~SQL.squish).present?
          SELECT 1 FROM pg_catalog.pg_class c
          JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = #{connection.quote(schema)} AND c.relname = #{connection.quote(table)}
        SQL
      end

      def quoted_role = quote_ident(ROLE)
      def quote_ident(name) = connection.quote_column_name(name)
      def quote_rel(schema, table) = "#{quote_ident(schema)}.#{quote_ident(table)}"
      def execute(sql) = connection.execute(sql)
      def connection = ActiveRecord::Base.connection
    end
  end
end
