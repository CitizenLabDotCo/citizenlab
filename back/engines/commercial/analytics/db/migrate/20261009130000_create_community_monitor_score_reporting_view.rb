# frozen_string_literal: true

# Grants follow in a separate main-app migration.
#
# This view selects from reporting_input_question_answers. Postgres won't drop
# a view that another view depends on, so a later update_view on
# reporting_input_question_answers must drop and recreate this one around it,
# then re-run `rake mcp_server:reprovision_analytics_reader`.
class CreateCommunityMonitorScoreReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_community_monitor_scores, version: 1
  end
end
