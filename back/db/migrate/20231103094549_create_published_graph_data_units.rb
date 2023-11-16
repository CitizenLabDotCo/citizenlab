class CreatePublishedGraphDataUnits < ActiveRecord::Migration[7.0]
  def change
    create_table :report_builder_published_graph_data_units, id: :uuid do |t|
      t.references :report_builder_report, null: false, foreign_key: true, index: { name: :report_builder_published_data_units_report_id_idx }, type: :uuid
      t.string :graph_id, null: false
      t.jsonb :data, null: false

      t.timestamps
    end
  end
end
