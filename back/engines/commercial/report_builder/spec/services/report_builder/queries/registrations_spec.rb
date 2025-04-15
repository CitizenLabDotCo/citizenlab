# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Registrations do
  subject(:query) { described_class.new(build(:user)) }

  describe "#run_query_untransformed" do
    before_all do
      create_list(:user, 3, registration_completed_at: Date.new(2022, 9, 10))
      create_list(:user, 7, registration_completed_at: Date.new(2022, 10, 10))
    end

    it 'returns correct data for current period' do
      start_at = Date.new(2022, 8, 1)
      end_at = Date.new(2022, 11, 1)

      result = query.run_query_untransformed(start_at, end_at)

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
      })
    end

    it 'filters dates correctly' do
      start_at = Date.new(2022, 8, 1)
      end_at = Date.new(2022, 10, 2)

      result = query.run_query_untransformed(start_at, end_at)

      expect(result).to eq({
        registrations_timeseries: [
          {
            registrations: 3,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        registrations_whole_period: 3,
      })
    end
  end
end