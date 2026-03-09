# frozen_string_literal: true

class ChangePhasesDatesToTimestamps < ActiveRecord::Migration[7.2]
  def up
    # Convert start_at/end_at from date to datetime and switch end_at to an
    # exclusive upper bound: a phase is active when `start_at <= now < end_at`.

    # Remove old constraint
    remove_check_constraint :phases, name: 'phases_start_before_end'

    # Change column types (requires table rewrite, but phases table is small)
    safety_assured do
      change_column :phases, :start_at, :datetime
      change_column :phases, :end_at, :datetime
    end

    # Backfill `end_at`. `start_at` does not need to change: Midnight UTC (auto-converted
    # by PG) is correct. `end_at` needs to be shifted forward by 1 day to keep the phase
    # active through the original end date.
    Phase.where.not(end_at: nil).update_all("end_at = end_at + interval '1 day'")

    # Add new constraint with strict inequality (start_at == end_at is invalid)
    add_check_constraint :phases,
      'start_at IS NULL OR end_at IS NULL OR start_at < end_at',
      name: 'phases_start_before_end', validate: false
  end

  def down
    remove_check_constraint :phases, name: 'phases_start_before_end'

    # Reverse the exclusive end boundary backfill before type conversion
    Phase.where.not(end_at: nil).update_all("end_at = end_at - interval '1 day'")

    safety_assured do
      change_column :phases, :start_at, :date
      change_column :phases, :end_at, :date
    end

    # Restore original constraint with <= for date semantics
    add_check_constraint :phases,
      'start_at IS NULL OR end_at IS NULL OR start_at <= end_at',
      name: 'phases_start_before_end', validate: false
  end
end
