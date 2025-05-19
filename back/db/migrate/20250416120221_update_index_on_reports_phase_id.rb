class UpdateIndexOnReportsPhaseId < ActiveRecord::Migration[7.1]
  def change
    # Remove the unique index
    remove_index :report_builder_reports, column: :phase_id, unique: true

    # Add a non-unique index
    add_index :report_builder_reports, :phase_id
  end
end
