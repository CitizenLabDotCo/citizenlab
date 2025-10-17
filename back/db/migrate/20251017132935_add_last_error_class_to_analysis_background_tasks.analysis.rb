# frozen_string_literal: true

# This migration comes from analysis (originally 20251017122900)
class AddLastErrorClassToAnalysisBackgroundTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :analysis_background_tasks, :last_error_class, :string
  end
end
