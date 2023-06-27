# frozen_string_literal: true

class AddVotesToBasketsIdeas < ActiveRecord::Migration[7.0]
  def change
    add_column :baskets_ideas, :votes, :integer, null: false, default: 1
    execute 'UPDATE ideas SET budget = 1 WHERE budget < 1'
    execute 'UPDATE baskets_ideas SET votes = ideas.budget FROM ideas WHERE ideas.id = baskets_ideas.idea_id'
  end
end
