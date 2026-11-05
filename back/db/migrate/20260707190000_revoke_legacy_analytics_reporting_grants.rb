# frozen_string_literal: true

# The MCP reporting surface cut over to the unified reporting_* views, so the
# legacy analytics views leave the whitelist and analytics_reader loses its
# read grants on them (the views themselves stay: the in-product /analytics
# endpoints still use them). Runs per tenant schema via Apartment. On fresh
# databases the earlier provisioning migrations never granted these (the
# whitelist no longer contains them), making this a safe no-op.
class RevokeLegacyAnalyticsReportingGrants < ActiveRecord::Migration[7.2]
  LEGACY_TABLES = %w[
    analytics_fact_participations
    analytics_dimension_dates
    analytics_dimension_projects
    analytics_dimension_types
    analytics_dimension_users
  ].freeze

  def up
    McpServer::AnalyticsReaderProvisioner.revoke!(LEGACY_TABLES)
  end

  def down
    schema = Apartment::Tenant.current
    connection = ActiveRecord::Base.connection
    LEGACY_TABLES.each do |table|
      quoted = "#{connection.quote_column_name(schema)}.#{connection.quote_column_name(table)}"
      connection.execute("GRANT SELECT ON #{quoted} TO analytics_reader")
    end
  end
end
