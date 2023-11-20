# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - ProjectStatus' do
  explanation 'Queries to summarise project statuses.'
  header 'Content-Type', 'application/json'

  before { admin_header_token }

  post 'web_api/v1/analytics' do
    before_all do
      create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' }) # open ended but archived
      create(:continuous_project, admin_publication_attributes: { publication_status: 'draft' }, phase_attrs: { start_at: '2022-01-01', end_at: '2022-01-31' }) # ended but draft
      create(:continuous_project) # published but open ended date
      create(:phase, start_at: '2022-01-01', end_at: '2022-01-31') # timeline published + finished
    end

    example 'gets counts by project status' do
      do_request({
        query: {
          fact: 'project_status',
          groups: 'status',
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data[:attributes]).to match_array([
        { status: 'draft', count: 1 },
        { status: 'published', count: 2 },
        { status: 'archived', count: 1 }
      ])
    end

    example 'gets projects that are finished' do
      do_request({
        query: {
          fact: 'project_status',
          filters: {
            finished: true
          },
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data[:attributes]).to eq([
        { count: 2 }
      ])
    end

    example 'gets published projects that NOT finished' do
      do_request({
        query: {
          fact: 'project_status',
          filters: {
            status: 'published',
            finished: false
          },
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data[:attributes]).to eq([
        { count: 1 }
      ])
    end
  end
end
