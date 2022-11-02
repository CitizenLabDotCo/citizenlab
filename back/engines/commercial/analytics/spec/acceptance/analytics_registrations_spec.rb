# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactRegistrations model' do
  explanation 'Queries to summarise registrations.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Create 3 users - 2 registered in Sept 2022 (admin & citizen) and 1 in Oct 2022 (citizen)
      create(:admin, registration_completed_at: '2022-09-01 10:15:00')
      create(:user, registration_completed_at: '2022-09-15 16:30:00')
      create(:user, registration_completed_at: '2022-10-1 16:30:00')

      # Create associated date dimensions
      create(:dimension_date, date: Date.new(2022, 9, 1))
      create(:dimension_date, date: Date.new(2022, 9, 15))
      create(:dimension_date, date: Date.new(2022, 10, 1))
    end

    example 'group registrations by month' do
      do_request({
        query: {
          fact: 'registration',
          groups: 'dimension_date_registration.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data).to match_array([
        { 'dimension_date_registration.month': '2022-09', count: 2 },
        { 'dimension_date_registration.month': '2022-10', count: 1 }
      ])
    end

    example 'filter between dates and return citizen registrations only' do
      do_request({
        query: {
          fact: 'registration',
          filters: {
            'dimension_date_registration.date': { from: '2022-09-01', to: '2022-09-30' },
            'dimension_user.role': ['citizen', nil]
          },
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data).to match_array([{ count: 1 }])
    end
  end
end
