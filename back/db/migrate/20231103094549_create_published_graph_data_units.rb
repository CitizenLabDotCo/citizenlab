class CreatePublishedGraphDataUnits < ActiveRecord::Migration[7.0]
  def change
    create_table :report_builder_published_graph_data_units, id: :uuid do |t|
      t.uuid :report_id, null: false, index: { name: :report_builder_published_data_units_report_id_idx }
      t.foreign_key :report_builder_reports, column: :report_id

      t.string :graph_id, null: false
      t.jsonb :data, null: false

      t.timestamps
    end
  end
end
