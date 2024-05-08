# This migration comes from report_builder (originally 20240418080235)
class AddUniquenessConstraintToReportPhaseId < ActiveRecord::Migration[7.0]
  def change
    remove_index :report_builder_reports, :phase_id
    add_index :report_builder_reports, :phase_id, unique: true
  end
end
