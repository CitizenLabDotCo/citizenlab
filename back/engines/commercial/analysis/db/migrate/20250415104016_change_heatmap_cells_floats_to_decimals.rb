class ChangeHeatmapCellsFloatsToDecimals < ActiveRecord::Migration[7.1]
  def change
    change_column :analysis_heatmap_cells, :lift, :decimal, precision: 20, scale: 15
    change_column :analysis_heatmap_cells, :p_value, :decimal, precision: 20, scale: 15
  end
end
