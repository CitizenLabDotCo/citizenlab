# frozen_string_literal: true

class AddShowInsightsToAnalyses < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_analyses, :show_insights, :boolean, default: true, null: false
  end
end
