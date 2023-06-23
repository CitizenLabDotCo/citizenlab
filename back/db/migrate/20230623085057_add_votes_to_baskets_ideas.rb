# frozen_string_literal: true

class AddVotesToBasketsIdeas < ActiveRecord::Migration[7.0]
  def change
    add_column :baskets_ideas, :integer, null: false, default: 1
    execute 'UPDATE ideas SET budget = 1 WHERE budget = 0'
    execute 'UPDATE baskets_ideas SET votes = ideas.budget LEFT OUTER JOIN ideas ON ideas.id = baskets_ideas.idea_id'
  end
end
