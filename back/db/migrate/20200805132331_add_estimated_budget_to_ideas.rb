class AddEstimatedBudgetToIdeas < ActiveRecord::Migration[6.0]
  def change
    add_column :ideas, :proposed_budget, :integer
  end
end
