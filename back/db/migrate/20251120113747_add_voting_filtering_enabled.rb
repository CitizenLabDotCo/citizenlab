class AddVotingFilteringEnabled < ActiveRecord::Migration[7.2]
  def change
    add_column :phases, :voting_filtering_enabled, :boolean, default: false, null: false
  end
end
