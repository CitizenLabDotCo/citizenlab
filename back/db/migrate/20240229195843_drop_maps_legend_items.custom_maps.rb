# This migration comes from custom_maps (originally 20240229195726)
class DropMapsLegendItems < ActiveRecord::Migration[7.0]
  def change
    drop_table :maps_legend_items
  end
end
