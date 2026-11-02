# frozen_string_literal: true

# Grants analytics_reader SELECT on the reporting views this stream adds
# (reporting_staff_activities, reporting_email_deliveries, reporting_invites,
# reporting_registrations), in one pass once they all exist. Runs per tenant
# schema via Apartment; the provisioner is idempotent and grants every
# REPORTING_TABLES relation present.
class GrantStaffOutreachAndSignUpReportingViews < ActiveRecord::Migration[7.2]
  def up
    McpServer::AnalyticsReaderProvisioner.provision!
  end

  def down
    # No-op: the grants disappear together with the views when the
    # view-creation migrations are rolled back.
  end
end
