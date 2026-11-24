# frozen_string_literal: true

# This migration comes from analytics (originally 20261028160000)
# Grants follow in a separate main-app migration.
class CreateInputAnalysisTagReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_input_analysis_tags, version: 1
  end
end
