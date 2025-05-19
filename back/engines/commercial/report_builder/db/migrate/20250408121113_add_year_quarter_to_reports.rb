# frozen_string_literal: true

class AddYearQuarterToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :report_builder_reports, :year, :integer, default: nil, null: true
    add_column :report_builder_reports, :quarter, :integer, default: nil, null: true
  end
end
