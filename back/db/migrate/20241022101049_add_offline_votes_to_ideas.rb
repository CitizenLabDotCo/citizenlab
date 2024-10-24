class AddOfflineVotesToIdeas < ActiveRecord::Migration[7.0]
  def change
    add_column :ideas, :manual_votes_amount, :integer, null: true
    add_reference :ideas, :manual_votes_last_updated_by, type: :uuid, index: true, foreign_key: { to_table: :users }, null: true
    add_column :ideas, :manual_votes_last_updated_at, :datetime, null: true
  end
end
