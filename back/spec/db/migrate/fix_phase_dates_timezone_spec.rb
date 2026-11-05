# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../db/migrate/20260421105121_fix_phase_dates_timezone'

RSpec.describe FixPhaseDatesTimezone do
  let(:migration) { described_class.new }

  describe '#up' do
    context 'with a positive UTC offset (Europe/Brussels, UTC+1/+2)' do
      before do
        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'Europe/Brussels'
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'shifts start_at and end_at from UTC midnight to local midnight' do
        # Simulate the state left by the original migration: UTC midnight values
        phase = create(:phase, start_at: '2026-03-15T00:00:00Z', end_at: '2026-04-15T00:00:00Z')

        migration.up

        phase.reload

        expect(phase.start_at).to eq(Time.utc(2026, 3, 14, 23, 0, 0)) # UTC+1 in March (CET)
        expect(phase.end_at).to eq(Time.utc(2026, 4, 14, 22, 0, 0)) # UTC+2 in April (CEST)

        # Verify the user-facing dates are correct
        expect(phase.start_date).to eq(Date.new(2026, 3, 15))
        expect(phase.end_date).to eq(Date.new(2026, 4, 14))
      end
    end

    context 'with a negative UTC offset (America/New_York, EDT=UTC-4)' do
      before do
        settings = AppConfiguration.instance.settings
        settings['core']['timezone'] = 'America/New_York'
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'shifts start_at and end_at from UTC midnight to local midnight' do
        phase = create(:phase, start_at: '2026-03-15T00:00:00Z', end_at: '2026-04-15T00:00:00Z')

        migration.up

        phase.reload
        # New York is EDT (UTC-4) during this time period
        expect(phase.start_at).to eq(Time.utc(2026, 3, 15, 4, 0, 0))
        expect(phase.end_at).to eq(Time.utc(2026, 4, 15, 4, 0, 0))

        expect(phase.start_date).to eq(Date.new(2026, 3, 15))
        expect(phase.end_date).to eq(Date.new(2026, 4, 14))
      end
    end
  end
end
