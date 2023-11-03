class CreatePublishedDataUnits < ActiveRecord::Migration[7.0]
  def change
    create_table :published_data_units, id: :uuid do |t|
      t.references :report_id, null: false, foreign_key: true, type: :uuid
      t.string :graph_id
      t.jsonb :data

      t.timestamps
    end
  end
end
