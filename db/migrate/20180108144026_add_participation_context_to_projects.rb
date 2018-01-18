class AddParticipationContextToProjects < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :participation_method, :string, default: 'ideation'
    add_column :projects, :posting_enabled, :boolean, default: 'true'
    add_column :projects, :commenting_enabled, :boolean, default: 'true'
    add_column :projects, :voting_enabled, :boolean, default: 'true'
    add_column :projects, :voting_method, :string, default: 'unlimited'
    add_column :projects, :voting_limited_max, :integer, default: 10
  end
end
