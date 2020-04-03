class CreateLayers < ActiveRecord::Migration[6.0]
  def change
    create_table :maps_layers, id: :uuid do |t|
      t.references :map_config, foreign_key: {to_table: :maps_map_configs}, index: true, type: :uuid, null: false
      t.jsonb :title_multiloc, null: false, default: {} 
      t.integer :ordering, null: false
      t.jsonb :geojson, null: false
      t.boolean :default_enabled, null: false, default: true
      t.string :marker_svg_url, null: true
      t.timestamps
    end
  end
end
