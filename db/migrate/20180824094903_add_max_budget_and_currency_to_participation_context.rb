class AddMaxBudgetAndCurrencyToParticipationContext < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :max_budget, :integer
  	add_column :phases,   :max_budget, :integer
  	add_column :projects, :currency,   :string
  	add_column :phases,   :currency,   :string
  end
end
