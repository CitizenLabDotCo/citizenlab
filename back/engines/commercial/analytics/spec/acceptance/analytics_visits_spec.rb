# frozen_string_literal: true

# Tests for queries needed by the visitors dashboard

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics API - Queries for visitors dashboard', use_transactional_fixtures: false do
  post 'web_api/v1/analytics' do
    before do
      header 'Content-Type', 'application/json'
      admin_header_token

      # Create 3 visits - 2 visitors, 1 with an admin user, 2 with a project, 2 in Sept, 1 in Aug, 1 Channel, 2 Locales
      create(:project)
      locale1 = create(:dimension_locale_en)
      visit1 = create(:fact_visit, matomo_visit_id: 1, duration: 100, pages_visited: 1)
      visit1.dimension_projects << Analytics::DimensionProject.first
      visit1.dimension_locales << locale1
      visit2 = create(:fact_visit, matomo_visit_id: 2, duration: 200, pages_visited: 2)
      visit2.dimension_projects << Analytics::DimensionProject.first
      visit2.dimension_locales << locale1

      user = create(:user)
      user.add_role 'admin'
      locale2 = create(:dimension_locale_nl)
      aug = create(:dimension_date_aug)
      visit3 = create(:fact_visit, matomo_visit_id: 3, duration: 300, pages_visited: 3, visitor_id: 'YYYY1')
      visit3.dimension_user = Analytics::DimensionUser.first
      visit3.dimension_date_first_action = aug
      visit3.dimension_date_last_action = aug
      visit3.dimension_locales << locale2
    end

    it 'Gets correct number of visits & visitors and correctly averages duration and pages visited' do
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
      expect(json_response_body[:data])
        .to eq([{
          avg_duration: '200.0',
          avg_pages_visited: '2.0',
          count: 3,
          count_visitor_id: 2
        }])
      #  Returning string for float?
    end

    it 'Can filter visits by day' do
      do_request({
        query: {
          fact: 'visit',
          filters: {
            dimension_date_last_action: {
              date: {
                from: '2022-09-01',
                to: '2022-09-30'
              }
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
      expect(json_response_body[:data])
        .to eq([{
          avg_duration: '150.0',
          avg_pages_visited: '1.5',
          count: 2,
          count_visitor_id: 1
        }])
    end

    it 'Can group visits by month' do
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
      expect(json_response_body[:data])
        .to eq([
          {
            'dimension_date_last_action.month': '2022-09',
            count: 2
          },
          {
            'dimension_date_last_action.month': '2022-08',
            count: 1
          }
        ])
      # Is order important here for the grouping?
    end

    it 'Can filter visitors by project' do
      project_id = Analytics::DimensionProject.first.id
      do_request({
        query: {
          fact: 'visit',
          filters: {
            dimension_projects: {
              id: project_id
            }
          },
          aggregations: {
            all: 'count',
            visitor_id: 'count'
          }
        }
      })
      assert_status 200
      expect(json_response_body[:data])
        .to eq([{
          count: 2,
          count_visitor_id: 1
        }])
    end

    it 'Can group visitors by language/locale' do
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
      expect(json_response_body[:data].length).to eq(2)
    end

    it 'Can group visitors by channel' do
      do_request({
        query: {
          fact: 'visit',
          groups: 'dimension_channel.id',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(json_response_body[:data].length).to eq(1)
    end

    it 'Can filter only visits by citizens or non-registered users (not admins or moderators)' do
      do_request({
        query: {
          fact: 'visit',
          filters: {
            dimension_user: {
              role: ['citizen', nil]
            }
          },
          aggregations: {
            all: 'count',
            visitor_id: 'count'
          }
        }
      })
      assert_status 200
      expect(json_response_body[:data])
        .to eq([{
          count: 2,
          count_visitor_id: 1
        }])
    end
  end
end
