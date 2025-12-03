# This migration comes from analysis (originally 20251017141026)
class AddLastErrorClassToAnalysisBackgroundTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :analysis_background_tasks, :last_error_class, :string
  end
end
