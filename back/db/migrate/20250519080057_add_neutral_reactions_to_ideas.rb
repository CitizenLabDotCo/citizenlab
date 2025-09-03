class AddNeutralReactionsToIdeas < ActiveRecord::Migration[7.1]
  def change
    add_column :ideas, :neutral_reactions_count, :integer, null: false, default: 0
  end
end
