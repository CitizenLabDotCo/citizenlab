# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - ProjectStatus' do
  explanation 'Queries to summarise project statuses.'
  header 'Content-Type', 'application/json'

  before { admin_header_token }

  post 'web_api/v1/analytics' do
    def log_status_change(project, status)
      # Similar to what is used in SideFxProjectService
      LogActivityJob.perform_now(project, status, nil, Time.zone.now)
    end

    before_all do
      continuous_p1, continuous_p2 = create_list(:continuous_project, 2)
      timeline_project = create(:phase, start_at: '2022-01-01', end_at: '2022-01-31').project

      log_status_change(continuous_p1, 'published')
      log_status_change(continuous_p1, 'deleted')

      log_status_change(continuous_p2, 'published')
      log_status_change(continuous_p2, 'archived') # continuous and archived = finished

      log_status_change(timeline_project, 'published')
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
      expect(response_data).to eq([
        { status: 'published', count: 1 },
        { status: 'finished', count: 2 },
        { status: 'deleted', count: 1 },
        { status: 'archived', count: 1 }
      ])
    end
  end
end
