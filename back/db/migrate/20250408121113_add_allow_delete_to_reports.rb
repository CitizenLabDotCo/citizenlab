# frozen_string_literal: true

class AddAllowDeleteToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :report_builder_reports, :allow_delete, :boolean, default: true
  end
end