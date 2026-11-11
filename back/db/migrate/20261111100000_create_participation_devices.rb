# frozen_string_literal: true

class CreateParticipationDevices < ActiveRecord::Migration[7.1]
  def change
    create_table :participation_devices, id: :uuid do |t|
      t.references :trackable, polymorphic: true, type: :uuid, null: false, index: false

      t.string :device_hash, null: false
      t.string :device_type
      t.string :browser_name
      t.string :os_name

      t.timestamps
    end

    # One device per participation; also serves the has_one lookup when exporting.
    add_index :participation_devices, %i[trackable_type trackable_id], unique: true, name: 'index_participation_devices_on_trackable'
  end
end
