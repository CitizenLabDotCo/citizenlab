# This migration comes from maps (originally 20200316134420)
class CreateLegendItems < ActiveRecord::Migration[6.0]
  def change
    create_table :maps_legend_items, id: :uuid do |t|
      t.references :map_config, foreign_key: {to_table: :maps_map_configs}, index: true, type: :uuid, null: false
      t.jsonb :title_multiloc, null: false, default: {} 
      t.string :color, null: false
      t.integer :ordering, null: false
      t.timestamps
    end
  end
end
