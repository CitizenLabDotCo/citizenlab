class AddExpireDaysLimitAndReactingThresholdToPhases < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :expire_days_limit, :integer
    add_column :phases, :reacting_threshold, :integer
  end
end
