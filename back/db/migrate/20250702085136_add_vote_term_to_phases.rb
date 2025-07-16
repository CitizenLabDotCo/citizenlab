class AddVoteTermToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :vote_term, :string, default: 'vote'
  end
end
