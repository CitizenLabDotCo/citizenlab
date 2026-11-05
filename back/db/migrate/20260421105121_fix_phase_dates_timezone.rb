# frozen_string_literal: true

# Corrects phase start_at/end_at values that were converted from date to datetime
# in UTC midnight instead of the tenant's local midnight.
# See 20260309120000_change_phases_dates_to_timestamps.rb for the original migration.
class FixPhaseDatesTimezone < ActiveRecord::Migration[7.2]
  class Phase < ActiveRecord::Base
    self.table_name = 'phases'
  end

  def up
    tz = Time.zone.tzinfo.identifier

    # Reinterpret UTC midnight as local midnight.
    Phase
      .where.not(start_at: nil)
      .update_all("start_at = start_at AT TIME ZONE '#{tz}' AT TIME ZONE 'UTC'")

    Phase
      .where.not(end_at: nil)
      .update_all("end_at = end_at AT TIME ZONE '#{tz}' AT TIME ZONE 'UTC'")
  end

  def down
    tz = Time.zone.tzinfo.identifier

    Phase
      .where.not(start_at: nil)
      .update_all("start_at = start_at AT TIME ZONE 'UTC' AT TIME ZONE '#{tz}'")

    Phase
      .where.not(end_at: nil)
      .update_all("end_at = end_at AT TIME ZONE 'UTC' AT TIME ZONE '#{tz}'")
  end
end
