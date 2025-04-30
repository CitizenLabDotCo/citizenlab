# frozen_string_literal: true

# This migration comes from report_builder (originally 20250408121113)
class AddYearQuarterToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :report_builder_reports, :year, :integer, default: nil, null: true
    add_column :report_builder_reports, :quarter, :integer, default: nil, null: true
  end
end
