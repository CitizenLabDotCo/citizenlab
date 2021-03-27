class AddVoteCountsToComments < ActiveRecord::Migration[5.1]
  def change
    add_column :comments, :upvotes_count, :integer, null: false, default: 0
    add_column :comments, :downvotes_count, :integer, null: false, default: 0
  end
end
