# frozen_string_literal: true

class CreateParticipationLocations < ActiveRecord::Migration[7.1]
  def change
    create_table :participation_locations, id: :uuid do |t|
      t.references :trackable, polymorphic: true, type: :uuid, null: false, index: false

      # Location data
      t.string :country_code, limit: 2 # ISO 3166-1 alpha-2
      t.string :country_name
      t.string :city
      t.string :region
      t.decimal :latitude, precision: 9, scale: 6
      t.decimal :longitude, precision: 9, scale: 6

      # Autonomous System Number for future VPN/proxy detection
      t.integer :asn

      t.timestamps
    end

    add_index :participation_locations, %i[trackable_type trackable_id], unique: true, name: 'index_participation_locations_on_trackable'
  end
end
