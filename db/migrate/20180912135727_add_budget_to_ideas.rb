class AddBudgetToIdeas < ActiveRecord::Migration[5.1]
  def change
  	add_column :ideas, :budget, :integer
  end
end
