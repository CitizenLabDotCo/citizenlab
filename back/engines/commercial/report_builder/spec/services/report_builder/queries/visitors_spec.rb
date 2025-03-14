# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Visitors do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      ### SEPTEMBER
      september = Date.new(2022, 9, 10)

      # Create sessions september
      create_list(:session, 2, monthly_user_hash: 'hash1', created_at: september)
      create(:session, monthly_user_hash: 'hash2', created_at: september)

      # Create sessions october
      create_list(:session, 3, monthly_user_hash: 'hash3', created_at: Date.new(2022, 10, 2))
      create_list(:session, 2, monthly_user_hash: 'hash4', created_at: Date.new(2022, 10, 10))
    end

    it 'filters dates correct' do
      start_at = Date.new(2022, 8, 1)
      end_at = Date.new(2022, 10, 1)

      expect(query.run_query(start_at, end_at)).to eq({
        time_series: [
          {
            :visits => 3,
            :visitors => 2,
            :date_group => Date.new(2022, 9, 1)
          },
        ],
        visits_total: 3,
        visitors_total: 2
      })
    end

    it 'returns correct data for current period when grouped by month' do
      start_at = Date.new(2022, 8, 1)
      end_at = Date.new(2022, 11, 1)

      expect(query.run_query(start_at, end_at)).to eq({
        time_series: [
          {
            :visits => 3,
            :visitors => 2,
            :date_group => Date.new(2022, 9, 1)
          },
          {
            :visits => 5,
            :visitors => 2,
            :date_group => Date.new(2022, 10, 1)
          }
        ],
        visits_total: 8,
        visitors_total: 4
      })
    end

    # it 'returns correct data for current period when grouped by week' do
    #   start_at = Date.new(2022, 8, 1)
    #   end_at = Date.new(2022, 10, 1)

    #   expect(query.run_query(start_at, end_at, resolution: 'week')).to eq({
    #     time_series: [{
    #       :visits => 3,
    #       :visitors => 2,
    #       :date_group => Date.new(2022, 9, 1)
    #     }],
    #     visits_total: 3,
    #     visitors_total: 2
    #   })
    # end

    # it 'returns correct data for current period when grouped by day' do
    #   start_at = Date.new(2022, 8, 1)
    #   end_at = Date.new(2022, 10, 1)

    #   expect(query.run_query(start_at, end_at, resolution: 'day')).to eq({
    #     time_series: [{
    #       :visits => 3,
    #       :visitors => 2,
    #       :date_group => Date.new(2022, 9, 1)
    #     }],
    #     visits_total: 3,
    #     visitors_total: 2
    #   })
    # end

    # it 'returns correct data with compared period' do
    #   ### OCTOBER
    #   october = Date.new(2022, 10, 10)

    #   ## Create sessions
    #   create_list(:session, 3, monthly_user_hash: 'hash3', created_at: october)
    #   create(:session, monthly_user_hash: 'hash4', created_at: october)

    #   # Create visit
    #   dim_oct = create(:dimension_date, date: october)

    #   create(:fact_visit, visitor_id: 'visitor-3', duration: 100, pages_visited: 1,
    #     dimension_date_first_action: dim_oct, dimension_date_last_action: dim_oct, dimension_referrer_type: @referrer_type)

    #   params = {
    #     start_at: Date.new(2022, 10, 2).to_s,
    #     end_at: Date.new(2022, 11, 1).to_s,
    #     compare_start_at: Date.new(2022, 8, 30).to_s,
    #     compare_end_at: Date.new(2022, 10, 1).to_s
    #   }

    #   expect(query.run_query(**params)).to eq(
    #     [
    #       [
    #         {
    #           'count' => 4,
    #           'count_monthly_user_hash' => 2,
    #           'dimension_date_created.month' => '2022-10',
    #           'first_dimension_date_created_date' => october
    #         }
    #       ],
    #       [{
    #         'count' => 4,
    #         'count_monthly_user_hash' => 2
    #       }],
    #       [{
    #         'avg_duration' => 100,
    #         'avg_pages_visited' => 1
    #       }],
    #       [{
    #         'count' => 3,
    #         'count_monthly_user_hash' => 2
    #       }],
    #       [{
    #         'avg_duration' => 150,
    #         'avg_pages_visited' => 1.5
    #       }]
    #     ]
    #   )
    # end
  end
end
