# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Graph data units' do
  explanation 'Data units for graphs in reports'

  header 'Content-Type', 'application/json'

  let(:project) { create(:project) }

  before do
    @gender = 'female'

    @custom_field = create(:custom_field_select, key: :gender, resource_type: 'User', options: [create(:custom_field_option, key: 'female')])

    filtered_date = Date.new(2022, 9, 1)
    craftjs_json = {
      'ROOT' => { 'type' => 'div', 'nodes' => ['gJxirq8X7m'], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
      'gJxirq8X7m' => {
        'type' => { 'resolvedName' => 'DemographicsWidget' },
        'nodes' => [],
        'props' => {
          'endAt' => (filtered_date + 1.year).to_time.iso8601,
          'title' => 'Demographics',
          'startAt' => (filtered_date - 1.year).to_time.iso8601,
          'customFieldId' => @custom_field.id
        },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'DemographicsWidget',
        'linkedNodes' => {}
      }
    }
    phase = create(:phase,
      start_at: Time.zone.today - 2.days,
      end_at: Time.zone.today + 2.days,
      project: project)

    @report = create(
      :report,
      :visible,
      layout: build(:layout, craftjs_json: craftjs_json),
      phase: phase
    )

    # Make TimeBoundariesParser work as expected
    AppConfiguration.instance.update!(
      created_at: filtered_date - 2.days,
      platform_start_at: filtered_date - 2.days
    )

    # This is used if the data query is implemented with Analytics API
    # create(:dimension_date, date: filtered_date)
    # create(:dimension_type, name: 'idea', parent: 'post')

    # With the current implementation, registration_completed_at is used to filter users by startAt/endAt.
    # But the participation date can be used instead in the future (Idea#created_at).
    participant = create(:user, gender: @gender, registration_completed_at: filtered_date)
    create(:idea, project: project, created_at: filtered_date, author: participant)
    _not_returned_idea = create(:idea, project: create(:project), created_at: filtered_date, author: create(:user, gender: @gender))
  end

  def expected_series
    { :_blank => 0, @gender => 1 }.symbolize_keys
  end

  get '/web_api/v1/reports/graph_data_units/live' do
    parameter :resolved_name, 'Name of graph component on FE'
    parameter :props, 'Props of graph component on FE that are stored in Craftjs JSON and used to query data'

    describe 'when user authorized' do
      before { admin_header_token }

      let(:resolved_name) { 'DemographicsWidget' }
      let(:props) { { project_id: project.id, custom_field_id: @custom_field.id } }

      example_request 'Get live data for graph only for relevant project' do
        assert_status 200
        expect(json_response_body.dig(:data, :attributes, :series)).to eq(expected_series)
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  get '/web_api/v1/reports/graph_data_units/published' do
    parameter :report_id, 'Report ID', required: true
    parameter :graph_id, 'Graph ID provided by Craftjs', required: true

    # parameters
    let(:report_id) { @report.id }
    let(:graph_id) { 'gJxirq8X7m' }

    # used for test setup
    let(:user) { create(:admin) }

    before do
      ReportBuilder::ReportPublisher.new(@report, user).publish
    end

    context 'when user has access to phase' do
      before do
        group = create(:group)
        create(:membership, user: user, group: group)
        project.update!(visible_to: 'groups', groups: [group])
        header_token_for user
      end

      example_request 'Get published data for graph' do
        assert_status 200
        expect(json_response_body.dig(:data, :attributes, :series)).to eq(expected_series)
      end
    end

    context "when user doesn't have access to phase" do
      before do
        user = create(:user)
        project.update!(visible_to: 'groups', groups: [])
        header_token_for user
      end

      example_request 'returns 401 (Unauthorized)' do
        assert_status 401
      end
    end

    context 'when user is not logged in' do
      example_request 'Get published data for graph' do
        assert_status 200
        expect(json_response_body.dig(:data, :attributes, :series)).to eq(expected_series)
      end
    end
  end
end
