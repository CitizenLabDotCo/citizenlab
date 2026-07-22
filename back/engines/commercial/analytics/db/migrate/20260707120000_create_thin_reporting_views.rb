# frozen_string_literal: true

# First slice of the unified reporting model exposed through the MCP reporting
# tools: the thin, near-passthrough views. The read grants for analytics_reader
# are added in a separate main-app migration that runs after this one.
class CreateThinReportingViews < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_projects, version: 1
    create_view :reporting_phases, version: 1
    create_view :reporting_sessions, version: 1
    create_view :reporting_pageviews, version: 1
  end
end
