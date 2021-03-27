class AddVoteCounterCachesToIdeas < ActiveRecord::Migration[5.0]
  def change
    add_column :ideas, :upvotes_count, :integer, null: false, default: 0
    add_column :ideas, :downvotes_count, :integer, null: false, default: 0
  end
end
