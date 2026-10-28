# frozen_string_literal: true

# Grants analytics_reader SELECT on the reporting views this stream adds
# (reporting_input_status_changes, reporting_input_phases,
# reporting_community_monitor_scores, reporting_input_imports,
# reporting_reference_distributions), in one pass once they all exist. Runs
# per tenant schema via Apartment; the provisioner is idempotent and grants
# every REPORTING_TABLES relation present.
class GrantMoreReportingViews < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the grants disappear together with the views when the
    # view-creation migrations are rolled back.
  end
end
