# frozen_string_literal: true

# This migration comes from report_builder (originally 20250829154300)
class AddCommunityMonitorColumnToReports < ActiveRecord::Migration[7.1]
  def change
    add_column :report_builder_reports, :community_monitor, :boolean, default: false, null: false
  end
end
