# frozen_string_literal: true

class AddTrackParticipationDeviceToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :track_participation_device, :boolean, default: false, null: false
  end
end
