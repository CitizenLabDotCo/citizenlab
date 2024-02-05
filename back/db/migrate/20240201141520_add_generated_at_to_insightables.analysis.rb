# This migration comes from analytics (originally 20240201141520)
class AddGeneratedAtToInsightables < ActiveRecord::Migration[7.0]
  def change
    %i[analysis_summaries analysis_questions].each do |table|
      add_column table, :generated_at, :timestamp
      ActiveRecord::Base.connection.execute "UPDATE #{table} SET generated_at = created_at WHERE state = 'succeeded'"
    end
  end
end
