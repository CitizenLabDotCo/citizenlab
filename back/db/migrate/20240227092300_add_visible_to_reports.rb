# frozen_string_literal: true

class AddVisibleToReports < ActiveRecord::Migration[7.0]
  def change
    add_column :report_builder_reports, :visible, :boolean, default: false, null: false
  end
end
