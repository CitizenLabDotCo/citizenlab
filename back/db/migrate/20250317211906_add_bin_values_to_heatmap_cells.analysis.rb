# This migration comes from analysis (originally 20250317201216)
class AddBinValuesToHeatmapCells < ActiveRecord::Migration[7.1]
  def change
    add_column :analysis_heatmap_cells, :row_bin_value, :integer, null: true
    add_column :analysis_heatmap_cells, :column_bin_value, :integer, null: true

    # A previous migration defined the following index
    # t.index %i[analysis_id row_id column_id unit], unique: true, name: 'index_analysis_heatmap_cells_uniqueness'
    # Now we modify it by adding the bin values to the index.
    # We need to drop the old index and create a new one with the bin values.
    remove_index :analysis_heatmap_cells, name: 'index_analysis_heatmap_cells_uniqueness'
    add_index :analysis_heatmap_cells, %i[analysis_id row_id column_id unit row_bin_value column_bin_value],
      unique: true,
      name: 'index_analysis_heatmap_cells_uniqueness'
  end
end
