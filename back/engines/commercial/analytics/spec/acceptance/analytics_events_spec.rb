# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactEvent' do
  explanation 'Queries to summarise events.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Using UTC explicitly, because (unfortunately) the fact_events view uses UTC
      # instead of the tenant timezone when converting timestamps to dates.
      times = [
        Time.utc(2022, 9, 1),
        Time.utc(2022, 9, 15),
        Time.utc(2022, 10, 1)
      ]

      times.each do |time|
        create(:dimension_date, date: time.to_date)
        create(:event, start_at: time, end_at: time)
      end
    end

    example 'group events by start month' do
      do_request({
        query: {
          fact: 'event',
          groups: 'dimension_date_start.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to contain_exactly({ 'dimension_date_start.month': '2022-09', count: 2 }, { 'dimension_date_start.month': '2022-10', count: 1 })
    end

    # example 'filter events by end date and project' do
    #   do_request({
    #     query: {
    #       fact: 'event',
    #       filters: {
    #         'dimension_date_end.date': { from: '2022-09-01', to: '2022-09-30' },
    #         'dimension_project.id': Project.first.id
    #       },
    #       aggregations: {
    #         all: 'count'
    #       }
    #     }
    #   })
    #   assert_status 200
    #   expect(response_data).to match_array([{ count: 1 }])
    # end
  end
end
