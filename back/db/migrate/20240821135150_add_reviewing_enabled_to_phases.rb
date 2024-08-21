class AddReviewingEnabledToPhases < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :reviewing_enabled, :boolean, default: false, null: false
  end
end
