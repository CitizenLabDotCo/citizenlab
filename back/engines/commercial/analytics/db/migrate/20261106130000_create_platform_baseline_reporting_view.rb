# frozen_string_literal: true

# Grants follow in a separate main-app migration.
#
# This view selects from reporting_projects, reporting_phases, reporting_contributions,
# reporting_pageviews and reporting_sessions. Postgres won't drop a view that another
# view depends on, so a later update_view on any of those must drop and recreate this
# one around it, then re-run `rake mcp_server:reprovision_analytics_reader`.
class CreatePlatformBaselineReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_platform_baselines, version: 1
  end
end
