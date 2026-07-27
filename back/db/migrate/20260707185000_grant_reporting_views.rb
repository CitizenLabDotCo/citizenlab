# frozen_string_literal: true

# Grants analytics_reader SELECT on the whole unified reporting surface, in one
# pass at the end of the stream once every reporting_* view exists. The model
# ships as a single unit, so this replaces the per-slice grant migrations the
# incremental build carried. Runs per tenant schema via Apartment and re-runs
# the idempotent provisioner, which grants every REPORTING_TABLES relation
# present at this point (all of them, here). New tenants are covered by
# MultiTenancy::TenantService#finalize_creation; later scope changes by
# `rake mcp_server:reprovision_analytics_reader`.
class GrantReportingViews < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the SELECT grants disappear together with the views when the
    # view-creation migrations are rolled back.
  end
end
