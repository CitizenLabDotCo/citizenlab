class AddReviewingEnabledToPhases < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :prescreening_enabled, :boolean, default: false, null: false
  end
end
