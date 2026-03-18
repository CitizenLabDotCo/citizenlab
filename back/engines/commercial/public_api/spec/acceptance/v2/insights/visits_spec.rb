# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Insights Visits' do
  explanation 'Platform visit statistics aggregated over time, including visits and unique visitors.'

  include_context 'common_auth'

  before do
    AppConfiguration.instance.update!(platform_start_at: '2025-01-01')
  end

  let(:project) { create(:project) }
  let(:other_project) { create(:project) }

  let(:session1) { create(:session, monthly_user_hash: 'user_hash_1') }
  let(:session2) { create(:session, monthly_user_hash: 'user_hash_2') }
  let(:session3) { create(:session, monthly_user_hash: 'user_hash_3') }

  before do
    # January 2025 pageviews for project
    create(:pageview, session: session1, project_id: project.id, created_at: '2025-01-15')
    create(:pageview, session: session2, project_id: project.id, created_at: '2025-01-20')

    # February 2025 pageviews for project
    create(:pageview, session: session1, project_id: project.id, created_at: '2025-02-10')
    create(:pageview, session: session3, project_id: project.id, created_at: '2025-02-15')

    # January 2025 pageview for other_project
    create(:pageview, session: session2, project_id: other_project.id, created_at: '2025-01-25')
  end

  get '/api/v2/insights/visits' do
    route_summary 'List visit statistics'
    route_description 'Retrieve visit and visitor counts aggregated by time period.'

    parameter :project_id, 'Filter visits to a specific project', in: :query, required: false, type: 'string'
    parameter :start_at, 'Start date for the time range (YYYY-MM-DD)', in: :query, required: false, type: 'string'
    parameter :end_at, 'End date for the time range (YYYY-MM-DD)', in: :query, required: false, type: 'string'
    parameter :resolution, 'Time grouping resolution: all, year, month, day, hour. Defaults to month.', in: :query, required: false, type: 'string'

    example_request 'Returns visits grouped by month (default)' do
      assert_status 200
      expect(json_response_body[:visits].size).to be >= 2
      expect(json_response_body[:visits].first).to have_key(:visits)
      expect(json_response_body[:visits].first).to have_key(:visitors)
      expect(json_response_body[:visits].first).to have_key(:date_group)
    end

    context 'with project_id filter' do
      let(:project_id) { project.id }

      example_request 'Returns visits for a specific project' do
        assert_status 200
        total_visits = json_response_body[:visits].sum { |v| v[:visits] }
        # Visits are distinct sessions per time bucket: Jan=2 (session1,2), Feb=2 (session1,3)
        expect(total_visits).to eq(4)
      end
    end

    context 'with start_at and end_at date range' do
      let(:start_at) { '2025-02-01' }
      let(:end_at) { '2025-02-28' }

      example_request 'Returns visits within the date range' do
        assert_status 200
        expect(json_response_body[:visits].size).to eq(1)
        expect(json_response_body[:visits].first[:visits]).to eq(2)
      end
    end

    context 'with resolution=day' do
      let(:resolution) { 'day' }
      let(:start_at) { '2025-01-01' }
      let(:end_at) { '2025-01-31' }

      example_request 'Returns visits grouped by day' do
        assert_status 200
        dates = json_response_body[:visits].map { |v| v[:date_group] }
        expect(dates.size).to be >= 2
      end
    end

    context 'with resolution=day and no start_at' do
      let(:resolution) { 'day' }

      example_request 'Defaults start_at to 1 year ago', document: false do
        assert_status 200
        # All test data is from Jan/Feb 2025, which is more than 1 year ago,
        # so no visits should be returned with the default start_at
        expect(json_response_body[:visits]).to be_empty
      end
    end

    context 'with resolution=day and has start_at' do
      let(:resolution) { 'day' }
      let(:start_at) { '2025-01-01' }
      let(:end_at) { '2025-01-31' }

      example_request 'Returns visits grouped by day with explicit start_at', document: false do
        assert_status 200
        expect(json_response_body[:visits].size).to be >= 2
        # Day resolution date_group should be date-only format
        expect(json_response_body[:visits].first[:date_group]).to match(/\A\d{4}-\d{2}-\d{2}\z/)
      end
    end

    context 'with resolution=hour and no start_at' do
      let(:resolution) { 'hour' }

      example_request 'Defaults start_at to 1 week ago', document: false do
        assert_status 200
        # All test data is from Jan/Feb 2025, well outside 1 week, so empty
        expect(json_response_body[:visits]).to be_empty
      end
    end

    context 'with resolution=hour and has start_at' do
      let(:resolution) { 'hour' }
      let(:start_at) { '2025-01-01' }
      let(:end_at) { '2025-01-31' }

      example_request 'Returns visits grouped by hour with time in date_group', document: false do
        assert_status 200
        expect(json_response_body[:visits].size).to be >= 1
        # Hour resolution date_group should include time
        expect(json_response_body[:visits].first[:date_group]).to match(/\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\z/)
      end
    end

    context 'with resolution=all' do
      let(:resolution) { 'all' }

      example_request 'Returns a single total row' do
        assert_status 200
        expect(json_response_body[:visits].size).to eq(1)
        expect(json_response_body[:visits].first).to have_key(:visits)
        expect(json_response_body[:visits].first).to have_key(:visitors)
        expect(json_response_body[:visits].first).not_to have_key(:date_group)
      end
    end

    context 'with invalid resolution' do
      let(:resolution) { 'invalid' }

      example_request 'Returns 400 error', document: false do
        assert_status 400
        expect(json_response_body[:parameter_name]).to eq('resolution')
      end
    end
  end
end
