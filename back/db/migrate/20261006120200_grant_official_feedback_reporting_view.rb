# frozen_string_literal: true

# Grants analytics_reader SELECT on reporting_official_feedbacks. Runs per
# tenant schema via Apartment; the provisioner is idempotent and grants every
# REPORTING_TABLES relation present.
class GrantOfficialFeedbackReportingView < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the grant disappears together with the view when the
    # view-creation migration is rolled back.
  end
end
