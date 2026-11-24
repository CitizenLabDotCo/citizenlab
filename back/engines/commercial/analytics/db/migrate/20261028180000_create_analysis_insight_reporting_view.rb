# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateAnalysisInsightReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_analysis_insights, version: 1
  end
end
