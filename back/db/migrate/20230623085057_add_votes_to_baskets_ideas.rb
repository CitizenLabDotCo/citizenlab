# frozen_string_literal: true

class AddVotesToBasketsIdeas < ActiveRecord::Migration[7.0]
  def change
    add_column :baskets_ideas, :votes, :integer, null: false, default: 1
    execute 'UPDATE ideas SET budget = 1 WHERE budget < 1'
    execute 'UPDATE baskets_ideas SET votes = ideas.budget FROM ideas WHERE ideas.id = baskets_ideas.idea_id'

    execute(
      # After https://stackoverflow.com/a/12963112/3585671
      <<-SQL.squish
      DELETE FROM baskets_ideas to_delete USING (
        SELECT MIN(id::text) AS id, basket_id, idea_id
          FROM baskets_ideas 
          GROUP BY (basket_id, idea_id) HAVING COUNT(*) > 1
        ) keep_from_duplicates
        WHERE to_delete.basket_id = keep_from_duplicates.basket_id
        AND to_delete.idea_id = keep_from_duplicates.idea_id
        AND to_delete.id::text <> keep_from_duplicates.id
      SQL
    )
    remove_index :baskets_ideas, name: :index_baskets_ideas_on_basket_id
    add_index :baskets_ideas, %i[basket_id idea_id], unique: true
  end
end
