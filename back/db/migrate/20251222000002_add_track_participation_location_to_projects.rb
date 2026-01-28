# frozen_string_literal: true

class AddTrackParticipationLocationToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :track_participation_location, :boolean, default: false, null: false
  end
end
