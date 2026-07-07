# frozen_string_literal: true

# Grants analytics_reader SELECT on the reporting_* views introduced by
# CreateThinReportingViews (projects, phases, sessions, pageviews), per tenant
# schema via Apartment. Re-runs the idempotent provisioner, which grants every
# REPORTING_TABLES entry whose relation exists at this point in the stream.
class GrantReportingThinViews < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the SELECT grants on the new views disappear together with the
    # views when CreateThinReportingViews is rolled back.
  end
end
