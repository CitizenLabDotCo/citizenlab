# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Registrations do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))

      # Setup September data: 3 registrations, 6 unique visitors
      create_list(:user, 3, registration_completed_at: Date.new(2022, 9, 10))
      6.times do |i|
        create(
          :session,
          created_at: Date.new(2022, 9, 10),
          monthly_user_hash: "september_visitor_#{i}"
        )
      end

      # Setup October data: 7 registrations, 14 unique visitors
      create_list(:user, 7, registration_completed_at: Date.new(2022, 10, 10))
      14.times do |i|
        create(
          :session,
          created_at: Date.new(2022, 10, 10),
          monthly_user_hash: "october_visitor_#{i}"
        )
      end
    end

    it 'returns correct data for current period' do
      result = query.run_query

      expect(result).to eq({
        registrations_timeseries: [
          {
            registrations: 3,
            date_group: Date.new(2022, 9, 1)
          },
          {
            registrations: 7,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        registrations_whole_period: 10,
        registration_rate_whole_period: 0.5
      })
    end

    it 'filters dates correctly' do
      start_at = Date.new(2022, 8, 1)
      end_at = Date.new(2022, 10, 2)

      result = query.run_query(start_at: start_at, end_at: end_at)

      expect(result).to eq({
        registrations_timeseries: [
          {
            registrations: 3,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        registrations_whole_period: 3,
        registration_rate_whole_period: 0.5
      })
    end

    it 'returns correct data with compared period' do
      start_at = Date.new(2022, 10, 1)
      end_at = Date.new(2022, 11, 1)
      compare_start_at = Date.new(2022, 9, 1)
      compare_end_at = Date.new(2022, 10, 1)

      result = query.run_query(
        start_at: start_at,
        end_at: end_at,
        compare_start_at: compare_start_at,
        compare_end_at: compare_end_at
      )

      expect(result).to eq({
        registrations_timeseries: [
          {
            registrations: 7,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        registrations_whole_period: 7,
        registration_rate_whole_period: 0.5,
        registrations_compared_period: 3,
        registration_rate_compared_period: 0.5
      })
    end
  end
end
