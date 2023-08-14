# This migration comes from analysis (originally 20230814114510)
class AddAccuracyAndInputIdsToSummaries < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_summaries, :accuracy, :float
    add_column :analysis_summaries, :inputs_ids, :jsonb
  end
end
