# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactParticipations' do
  explanation 'Queries to summarise participations.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Date dimensions
      dates = [Date.new(2022, 9, 2), Date.new(2022, 9, 15), Date.new(2022, 10, 2), Date.new(2022, 10, 15)]
      dates.each do |date|
        create(:dimension_date, date: date)
      end

      # Type dimensions
      [
        { name: 'idea', parent: 'post' },
        { name: 'comment', parent: 'idea' },
        { name: 'reaction', parent: 'idea' }
      ].each do |type|
        create(:dimension_type, name: type[:name], parent: type[:parent])
      end

      male = create(:user, gender: 'male')
      female = create(:user, gender: 'female')
      _unspecified = create(:user, gender: 'unspecified')

      # Create participations (3 by citizens, 1 by admin)
      idea = create(:idea, created_at: dates[0], author: male)
      create(:comment, created_at: dates[2], idea: idea, author: female)
      create(:reaction, created_at: dates[3], user: create(:admin, gender: 'female'), reactable: idea)
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
      expect(response_data[:attributes]).to contain_exactly({ 'dimension_date_created.month': '2022-09', count: 1 }, { 'dimension_date_created.month': '2022-10', count: 2 })
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
      expect(response_data[:attributes]).to contain_exactly({ count: 1 })
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
      expect(response_data[:attributes]).to contain_exactly({ count: 3 })
    end
  end
end
