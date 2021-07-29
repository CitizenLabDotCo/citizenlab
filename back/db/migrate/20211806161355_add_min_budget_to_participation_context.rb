class AddMinBudgetToParticipationContext < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :min_budget, :integer, default: 0
    add_column :phases, :min_budget, :integer, default: 0
  end
end
