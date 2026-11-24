# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactEvent do
  context 'when an event is created' do
    # Explicit midday UTC timestamps, so the dates are the same in UTC (used by
    # the SQL view) and in the tenant timezone (Time.zone), regardless of when
    # the test runs.
    let!(:event) do
      create(
        :event,
        created_at: Time.utc(2022, 11, 10, 12),
        start_at: Time.utc(2022, 12, 1, 12),
        end_at: Time.utc(2022, 12, 2, 12)
      )
    end

    it 'is also available as an event fact' do
      fact_event = described_class.find(event.id)
      expect(fact_event.dimension_project_id).to eq(event.project_id)
      expect(fact_event.dimension_date_created_id).to eq(Date.new(2022, 11, 10))
      expect(fact_event.dimension_date_start_id).to eq(Date.new(2022, 12, 1))
      expect(fact_event.dimension_date_end_id).to eq(Date.new(2022, 12, 2))
    end
  end
end
