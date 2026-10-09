# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateCommunityMonitorScoreReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_community_monitor_scores, version: 1
  end
end
