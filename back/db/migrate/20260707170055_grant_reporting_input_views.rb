# frozen_string_literal: true

# Grants analytics_reader SELECT on the reporting views introduced by
# CreateInputReportingViews (inputs, input tags/statuses/votes/reactions), per
# tenant schema via Apartment. Re-runs the idempotent provisioner, which grants
# every REPORTING_TABLES entry whose relation exists at this point in the stream.
class GrantReportingInputViews < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the SELECT grants on the new views disappear together with the
    # views when CreateInputReportingViews is rolled back.
  end
end
