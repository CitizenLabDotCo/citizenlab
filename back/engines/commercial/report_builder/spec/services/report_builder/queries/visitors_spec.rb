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
        end_at: Date.new(2022, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        visitors_timeseries: [
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
        visits_whole_period: 8,
        visitors_whole_period: 4,
        avg_seconds_per_session_whole_period: 135,
        avg_pages_visited_whole_period: 1.5
      })
    end

    it 'filters dates correctly' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 10, 1)
      }

      expect(query.run_query(**params)).to eq({
        visitors_timeseries: [
          {
            visits: 3,
            visitors: 2,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        visits_whole_period: 3,
        visitors_whole_period: 2,
        avg_seconds_per_session_whole_period: 200,
        avg_pages_visited_whole_period: 2
      })
    end

    it 'returns correct data for current period when grouped by week' do
      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        resolution: 'week'
      }

      expect(query.run_query(**params)[:visitors_timeseries]).to eq([
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

      expect(query.run_query(**params)[:visitors_timeseries]).to eq([
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
        visitors_timeseries: [
          {
            visits: 2,
            visitors: 2,
            date_group: Date.new(2022, 9, 1)
          }
        ],
        visits_whole_period: 2,
        visitors_whole_period: 2,
        avg_seconds_per_session_whole_period: 240,
        avg_pages_visited_whole_period: 2
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
        visitors_timeseries: [
          {
            visits: 5,
            visitors: 2,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        visits_whole_period: 5,
        visitors_whole_period: 2,
        avg_seconds_per_session_whole_period: 60 * 1.2,
        avg_pages_visited_whole_period: 1.2,

        visits_compared_period: 3,
        visitors_compared_period: 2,
        avg_seconds_per_session_compared_period: 200,
        avg_pages_visited_compared_period: 2
      })
    end

    it 'works if everything is nil' do
      params = {
        start_at: Date.new(2023, 10, 1),
        end_at: Date.new(2023, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        visitors_timeseries: [],
        visits_whole_period: 0,
        visitors_whole_period: 0,
        avg_seconds_per_session_whole_period: 0,
        avg_pages_visited_whole_period: 0
      })
    end

    it 'applies exclude_roles filter' do
      # Create session december (admin)
      session = create(:session, created_at: Date.new(2022, 12, 2), highest_role: 'admin')
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 10, 0, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2023, 1, 1),
        exclude_roles: 'exclude_admins_and_moderators'
      }

      expect(query.run_query(**params)).to eq({
        visitors_timeseries: [
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
        visits_whole_period: 8,
        visitors_whole_period: 4,
        avg_seconds_per_session_whole_period: 135,
        avg_pages_visited_whole_period: 1.5
      })
    end

    it 'removes page views where time spent on page is over 2 hours' do
      # Create session december (long time spent on page)
      # We add a lot of pageviews just in order to not have ugly decimals in the results
      # If the removal of page views over 2 hours did not work, this would massively
      # increase the avg_seconds_per_session_whole_period. But as you can see below it only increases
      # it a little, which is due to the avg_pages_visited_whole_period increasing.
      session = create(:session, created_at: Date.new(2022, 12, 2))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 10, 0, 0))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 12, 1, 0))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 14, 2, 0))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 16, 3, 0))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 18, 4, 0))
      create(:pageview, session_id: session.id, path: '/en/', created_at: DateTime.new(2022, 12, 2, 20, 5, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2023, 1, 1)
      }

      result = query.run_query(**params)

      expect(result[:visits_whole_period]).to eq(9)
      expect(result[:visitors_whole_period]).to eq(5)
      expect(result[:avg_seconds_per_session_whole_period]).to eq(180)
      expect(result[:avg_pages_visited_whole_period]).to eq(2)
    end

    it 'for avg seconds and pages per session: it ignores sessions without pageviews' do
      # Create sessions with no pageviews
      10.times do
        create(:session, created_at: Date.new(2022, 7, 2), monthly_user_hash: 'some_hash')
      end

      params = {
        start_at: Date.new(2022, 7, 1),
        end_at: Date.new(2023, 1, 1)
      }

      result = query.run_query(**params)

      expect(result[:visits_whole_period]).to eq(18) # should increase
      expect(result[:visitors_whole_period]).to eq(5) # should increase
      expect(result[:avg_seconds_per_session_whole_period]).to eq(135) # should not be affected
      expect(result[:avg_pages_visited_whole_period]).to eq(1.5) # should not be affected
    end
  end
end
