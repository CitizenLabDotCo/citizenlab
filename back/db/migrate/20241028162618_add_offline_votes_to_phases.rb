class AddOfflineVotesToPhases < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :manual_votes_count, :integer, null: false, default: 0
    add_column :phases, :manual_voters_amount, :integer, null: true
    add_reference :phases, :manual_voters_last_updated_by, type: :uuid, index: true, foreign_key: { to_table: :users }, null: true
    add_column :phases, :manual_voters_last_updated_at, :datetime, null: true
  end
end
