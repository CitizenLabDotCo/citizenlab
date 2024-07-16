# frozen_string_literal: true

class AddPhaseToReports < ActiveRecord::Migration[7.0]
  def change
    add_reference :report_builder_reports, :phase, type: :uuid, index: true, foreign_key: true

    change_column_null :report_builder_reports, :name, true
  end
end
