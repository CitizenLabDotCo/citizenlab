class AddSimilarityThresholdsToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :similarity_threshold_title, :float
    add_column :phases, :similarity_threshold_body, :float
  end
end
