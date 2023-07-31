# frozen_string_literal: true

class AddGeocodedLocationToEvents < ActiveRecord::Migration[7.0]
  def change
    change_table :events do |t|
      t.st_point :location_point, geographic: true
      t.string :location_description
      t.index :location_point, using: :gist
    end

    initialize_location_descriptions!
  end

  private

  def initialize_location_descriptions!
    return if Apartment::Tenant.current == 'public'

    platform_locale = AppConfiguration.instance.settings('core', 'locales').first
    # The location description is set to one of the location_multiloc values. If the
    # multiloc has a value for the first platform locale, that value is used. Otherwise,
    # we fall back to any other available value.
    ActiveRecord::Base.connection.execute <<~SQL.squish
      WITH location_descriptions AS (
        SELECT DISTINCT ON (id)
          id,
          value
        FROM events, jsonb_each_text(events.location_multiloc)
        ORDER BY id, (key = '#{platform_locale}') DESC
      )
      UPDATE events
      SET location_description = location_descriptions.value
      FROM location_descriptions
      WHERE location_descriptions.id = events.id;
    SQL
  end
end
