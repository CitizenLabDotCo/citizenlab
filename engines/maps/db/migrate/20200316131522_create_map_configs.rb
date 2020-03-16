class CreateMapConfigs < ActiveRecord::Migration[6.0]
  def change
    create_table :maps_map_configs, id: :uuid do |t|
      t.references :project, null: false, type: :uuid, index: true
      t.st_point :center, geographic: true, null: true
      t.decimal :zoom_level, precision: 4, scale: 2, null: true
      t.string :tile_provider, null: true
      t.timestamps
    end
  end
end
