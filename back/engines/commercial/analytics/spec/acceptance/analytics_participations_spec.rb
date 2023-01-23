# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactParticipations' do
  explanation 'Queries to summarise participations/active users.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Date dimensions
      dates = [Date.new(2022, 9, 1), Date.new(2022, 9, 15), Date.new(2022, 10, 1), Date.new(2022, 10, 15)]
      dates.each do |date|
        create(:dimension_date, date: date)
      end

      # Type dimensions
      %w[idea initiative comment vote].each do |type|
        create(:dimension_type, name: type)
      end

      # Create participations (3 by citizens, 1 by admin)
      idea = create(:idea, created_at: dates[0])
      create(:comment, created_at: dates[2], post: idea)
      create(:vote, created_at: dates[3], user: create(:admin), votable: idea)
      create(:initiative, created_at: dates[1])
    end

    example 'group participations by month' do
      do_request({
        query: {
          fact: 'participation',
          groups: 'dimension_date_created.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data).to match_array([
        { 'dimension_date_created.month': '2022-09', count: 2 },
        { 'dimension_date_created.month': '2022-10', count: 2 }
      ])
    end

    example 'filter between dates and return citizen participations only' do
      do_request({
        query: {
          fact: 'participation',
          filters: {
            'dimension_date_created.date': { from: '2022-10-01', to: '2022-10-31' },
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

    example 'filter participations by project' do
      do_request({
        query: {
          fact: 'participation',
          filters: {
            'dimension_project.id': Project.first.id
          },
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data).to match_array([{ count: 3 }])
    end
  end
end
