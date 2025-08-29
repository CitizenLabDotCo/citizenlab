# frozen_string_literal: true

class AddCommunityMonitorColumnToReports < ActiveRecord::Migration[7.1]
  def change
    add_column :report_builder_reports, :community_monitor, :boolean, default: false, null: false
  end
end
