class AddMaxBudgetToParticipationContext < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :max_budget, :integer
  	add_column :phases,   :max_budget, :integer
  end
end
