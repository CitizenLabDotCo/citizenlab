class AddSimilarityEnabledToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :similarity_enabled, :boolean, null: false, default: true
  end
end
