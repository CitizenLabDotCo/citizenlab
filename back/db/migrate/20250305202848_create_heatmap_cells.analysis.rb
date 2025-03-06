# This migration comes from analysis (originally 20250305140800)
class CreateHeatmapCells < ActiveRecord::Migration[7.1]
  def change
    create_table :analysis_heatmap_cells, id: :uuid do |t|
      t.references :analysis, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_analyses }
      t.references :row, type: :uuid, polymorphic: true, null: false, index: true
      t.references :column, type: :uuid, polymorphic: true, null: false, index: true
      t.string :unit, null: false
      t.integer :count, null: false
      t.float :lift, null: false
      t.float :p_value, null: false

      t.index %i[analysis_id row_id column_id unit], unique: true, name: 'index_analysis_heatmap_cells_uniqueness'
      t.timestamps
    end
  end
end
