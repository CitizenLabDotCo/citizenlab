class AddParticipatoryBudgetToIdeas < ActiveRecord::Migration[5.1]
  def change
  	add_column :ideas, :participatory_budget, :integer
  end
end
