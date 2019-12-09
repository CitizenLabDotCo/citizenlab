class AddLocationAllowedToParticipationContext < ActiveRecord::Migration[5.2]
  def change
    add_column :phases, :location_allowed, :boolean, default: true, null: false
    add_column :projects, :location_allowed, :boolean, default: true, null: false
  end
end
