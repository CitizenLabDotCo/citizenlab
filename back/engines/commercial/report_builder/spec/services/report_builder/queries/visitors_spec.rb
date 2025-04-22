# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Visitors do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))

      ### SEPTEMBER
      september = Date.new(2022, 9, 10)

      # Create project
      project = create(:project_with_active_ideation_phase)

      # Get project path
      project_path = "/en/projects/#{project.slug}"
      @project_id = project.id

      # Create sessions september
      session1 = create(:session, monthly_user_hash: 'hash1', created_at: september)
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 9, 10, 10, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 9, 10, 10, 1, 0))

      session2 = create(:session, monthly_user_hash: 'hash1', created_at: september)
      create(:pageview, session_id: session2.id, path: project_path, project_id: @project_id, created_at: DateTime.new(2022, 9, 10, 11, 0, 0))

      session3 = create(:session, monthly_user_hash: 'hash2', created_at: september)
      create(:pageview, session_id: session3.id, path: '/en/', created_at: DateTime.new(2022, 9, 10, 12, 0, 0))
      create(:pageview, session_id: session3.id, path: project_path, project_id: @project_id, created_at: DateTime.new(2022, 9, 10, 12, 2, 0))
      create(:pageview, session_id: session3.id, path: '/en/ideas', created_at: DateTime.new(2022, 9, 10, 12, 4, 0))

      # Create sessions october
      session4 = create(:session, monthly_user_hash: 'hash3', created_at: Date.new(2022, 10, 2))
      create(:pageview, session_id: session4.id, path: '/en/', created_at: DateTime.new(2022, 10, 2, 10, 0, 0))

      session5 = create(:session, monthly_user_hash: 'hash3', created_at: Date.new(2022, 10, 2))
      create(:pageview, session_id: session5.id, path: '/en/', created_at: DateTime.new(2022, 10, 2, 11, 0, 0))

      session6 = create(:session, monthly_user_hash: 'hash3', created_at: Date.new(2022, 10, 2))
      create(:pageview, session_id: session6.id, path: '/en/', created_at: DateTime.new(2022, 10, 2, 12, 0, 0))

      session7 = create(:session, monthly_user_hash: 'hash4', created_at: Date.new(2022, 10, 10))
      create(:pageview, session_id: session7.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 10, 0, 0))

      session8 = create(:session, monthly_user_hash: 'hash4', created_at: Date.new(2022, 10, 10))
      create(:pageview, session_id: session8.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session8.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 1, 0))
    end

    it 'returns correct data for current period' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
      }

      expect(query.run_query(**params)).to eq({
        time_series: [
          {
            visits: 3,
            visitors: 2,
            date_group: Date.new(2022, 9, 1)
          },
          {
            visits: 5,
            visitors: 2,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        visits_total: 8,
        visitors_total: 4,
        avg_seconds_on_page: 90,
        avg_pages_visited: 12 / 8
      })
    end

    it 'filters dates correctly' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 10, 1),
      }

      expect(query.run_query(**params)).to eq({
        time_series: [
          {
            visits: 3,
            visitors: 2,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        visits_total: 3,
        visitors_total: 2,
        avg_seconds_on_page: 100,
        avg_pages_visited: 6 / 3
      })
    end

    it 'returns correct data for current period when grouped by week' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        resolution: 'week'
      }

      expect(query.run_query(**params)[:time_series]).to eq([
        {
          visits: 3,
          visitors: 2,
          date_group: Date.new(2022, 9, 5)
        },
        {
          visits: 3,
          visitors: 1,
          date_group: Date.new(2022, 9, 26)
        },
        {
          visits: 2,
          visitors: 1,
          date_group: Date.new(2022, 10, 10)
        }
      ])
    end

    it 'returns correct data for current period when grouped by day' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        resolution: 'day'
      }

      expect(query.run_query(**params)[:time_series]).to eq([
        {
          visits: 3,
          visitors: 2,
          date_group: Date.new(2022, 9, 10)
        },
        {
          visits: 3,
          visitors: 1,
          date_group: Date.new(2022, 10, 2)
        },
        {
          visits: 2,
          visitors: 1,
          date_group: Date.new(2022, 10, 10)
        }
      ])
    end

    it 'filters by project' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        project_id: @project_id
      }

      expect(query.run_query(**params)).to eq({
        time_series: [
          {
            visits: 2,
            visitors: 2,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        visits_total: 2,
        visitors_total: 2,
        avg_seconds_on_page: 120,
        avg_pages_visited: 2
      })
    end

    it 'returns correct data with compared period' do
      params = {
        start_at: Date.new(2022, 10, 1),
        end_at: Date.new(2022, 11, 1),
        compare_start_at: Date.new(2022, 9, 1),
        compare_end_at: Date.new(2022, 10, 1)
      }

      expect(query.run_query(**params)).to eq({
        time_series: [
          {
            visits: 5,
            visitors: 2,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        visits_total: 5,
        visitors_total: 2,
        avg_seconds_on_page: 60,
        avg_pages_visited: 6 / 5,

        compare_visits_total: 3,
        compare_visitors_total: 2,
        compare_avg_seconds_on_page: 100,
        compare_avg_pages_visited: 6 / 3
      })
    end

    it 'works if everything is nil' do
      params = {
        start_at: Date.new(2023, 10, 1),
        end_at: Date.new(2023, 11, 1),
      }

      expect(query.run_query(**params)).to eq({
        time_series: [],
        visits_total: 0,
        visitors_total: 0,
        avg_seconds_on_page: 0,
        avg_pages_visited: 0
      })
    end
  end
end
