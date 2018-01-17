class AddParticipationContextToPhases < ActiveRecord::Migration[5.1]
  def change
    add_column :phases, :participation_method, :string, default: 'ideation', null: false
    add_column :phases, :posting_enabled, :boolean, default: true
    add_column :phases, :commenting_enabled, :boolean, default: true
    add_column :phases, :voting_enabled, :boolean, default: true
    add_column :phases, :voting_method, :string, default: 'unlimited'
    add_column :phases, :voting_limited_max, :integer, default: 10
  end
end
