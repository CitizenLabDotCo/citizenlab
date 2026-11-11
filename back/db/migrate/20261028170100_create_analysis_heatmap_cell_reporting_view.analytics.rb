# frozen_string_literal: true

# This migration comes from analytics (originally 20261028170000)
# Grants follow in a separate main-app migration.
class CreateAnalysisHeatmapCellReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_analysis_heatmap_cells, version: 1
  end
end
