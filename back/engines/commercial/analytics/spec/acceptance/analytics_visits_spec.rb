# frozen_string_literal: true

# Tests for queries needed by the visitors dashboard

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - Visits model' do
  explanation 'Queries to summarise visit data imported from Matomo.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Create 3 visits - 2 visitors - Single referrer
      # Visitor 1 - 2 visits, no user, with a project, in Sept
      create(:project)
      locale1 = create(:dimension_locale)
      referrer_type = create(:dimension_referrer_type)
      sept = create(:dimension_date, date: Date.new(2022, 9, 1))
      visit1 = create(:fact_visit, visitor_id: 'v-1', duration: 100, pages_visited: 1,
        dimension_date_first_action: sept, dimension_date_last_action: sept, dimension_referrer_type: referrer_type)
      visit1.dimension_projects << Analytics::DimensionProject.first
      visit1.dimension_locales << locale1

      visit2 = create(:fact_visit, visitor_id: 'v-1', duration: 200, pages_visited: 2,
        dimension_date_first_action: sept, dimension_date_last_action: sept, dimension_referrer_type: referrer_type)
      visit2.dimension_projects << Analytics::DimensionProject.first
      visit2.dimension_locales << locale1

      # Visitor 2 - 1 visit, admin user, same channel, no project, different locale, in Aug
      create(:admin)
      locale2 = create(:dimension_locale, name: 'nl')
      aug = create(:dimension_date, date: Date.new(2022, 8, 1))
      visit3 = create(:fact_visit, duration: 300, pages_visited: 3, visitor_id: 'v-2',
        dimension_user: Analytics::DimensionUser.first, dimension_date_first_action: aug,
        dimension_date_last_action: aug, dimension_referrer_type: referrer_type)
      visit3.dimension_locales << locale2
    end

    example 'correct number of visits & visitors and correctly averages duration and pages visited' do
      do_request({
        query: {
          fact: 'visit',
          aggregations: {
            all: 'count',
            visitor_id: 'count',
            duration: 'avg',
            pages_visited: 'avg'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes])
        .to contain_exactly({
          avg_duration: '200.0',
          avg_pages_visited: '2.0',
          count: 3,
          count_visitor_id: 2
        })
    end

    example 'filter visits between dates' do
      do_request({
        query: {
          fact: 'visit',
          filters: {
            'dimension_date_last_action.date': {
              from: '2022-09-01',
              to: '2022-09-30'
            }
          },
          aggregations: {
            all: 'count',
            visitor_id: 'count',
            duration: 'avg',
            pages_visited: 'avg'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes])
        .to eq([{
          avg_duration: '150.0',
          avg_pages_visited: '1.5',
          count: 2,
          count_visitor_id: 1
        }])
    end

    example 'group visits by month' do
      do_request({
        query: {
          fact: 'visit',
          groups: 'dimension_date_last_action.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes])
        .to contain_exactly({
          'dimension_date_last_action.month': '2022-09',
          count: 2
        }, {
          'dimension_date_last_action.month': '2022-08',
          count: 1
        })
    end

    example 'filter visitors by project' do
      project_id = Analytics::DimensionProject.first.id
      do_request({
        query: {
          fact: 'visit',
          filters: {
            'dimension_projects.id': project_id
          },
          aggregations: {
            all: 'count',
            visitor_id: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes])
        .to contain_exactly({
          count: 2,
          count_visitor_id: 1
        })
    end

    example 'group visitors by language/locale' do
      do_request({
        query: {
          fact: 'visit',
          groups: 'dimension_locales.id',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes].size).to eq(2)
    end

    example 'group visitors by referrer type' do
      do_request({
        query: {
          fact: 'visit',
          groups: 'dimension_referrer_type.id',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes].size).to eq(1)
    end

    example 'filter only visits by citizens or non-registered users (not admins or moderators)' do
      do_request({
        query: {
          fact: 'visit',
          filters: {
            'dimension_user.role': ['citizen', nil]
          },
          aggregations: {
            all: 'count',
            visitor_id: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes])
        .to contain_exactly({
          count: 2,
          count_visitor_id: 1
        })
    end
  end
end
