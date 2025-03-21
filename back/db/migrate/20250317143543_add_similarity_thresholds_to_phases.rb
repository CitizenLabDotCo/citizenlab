class AddSimilarityThresholdsToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :similarity_threshold_title, :float, default: 0.3
    add_column :phases, :similarity_threshold_body, :float, default: 0.4
  end
end
