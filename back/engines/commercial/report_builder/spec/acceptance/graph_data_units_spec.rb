# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Graph data units' do
  explanation 'Data units for graphs in reports'

  header 'Content-Type', 'application/json'

  before do
    @gender = 'female'

    participation_date = Date.new(2022, 9, 1)
    project = create(:project)
    craftjs_jsonmultiloc = {
      'en' => {
        'ROOT' => { 'type' => 'div', 'nodes' => ['gJxirq8X7m'], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
        'gJxirq8X7m' => {
          'type' => { 'resolvedName' => 'GenderWidget' },
          'nodes' => [],
          'props' => {
            'endAt' => (participation_date + 1.year).to_time.iso8601,
            'title' => 'Users by gender',
            'startAt' => (participation_date - 1.year).to_time.iso8601,
            'projectId' => project.id
          },
          'custom' => {
            'title' => { 'id' => 'app.containers.admin.ReportBuilder.charts.usersByGender', 'defaultMessage' => 'Users by gender' },
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => 'ROOT',
          'isCanvas' => false,
          'displayName' => 'GenderWidget',
          'linkedNodes' => {}
        }
      }
    }
    phase = create(:phase, start_at: Time.zone.today - 2.days, end_at: Time.zone.today + 2.days)
    @report = create(:report, layout: build(:layout, craftjs_jsonmultiloc: craftjs_jsonmultiloc), phase: phase)

    create(:dimension_date, date: participation_date)
    create(:dimension_type, name: 'idea', parent: 'post')
    create(:custom_field, key: :gender, resource_type: 'User')
    create(:idea, project: project, created_at: participation_date, author: create(:user, gender: @gender))
  end

  get '/web_api/v1/reports/graph_data_units/live' do
    parameter :resolved_name, 'Name of graph component on FE'

    describe 'when authorized' do
      before { admin_header_token }

      let(:resolved_name) { 'GenderWidget' }

      example_request 'Get live data for graph' do
        assert_status 200
        expected_attrs = [{
          count_dimension_user_custom_field_values_dimension_user_id: 1,
          'dimension_user_custom_field_values.value': @gender
        }]
        expect(json_response_body.dig(:data, :attributes)).to eq(expected_attrs)
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  get '/web_api/v1/reports/graph_data_units/published' do
    parameter :report_id, 'Report ID', required: true
    parameter :graph_id, 'Graph ID provided by Craftjs', required: true

    let(:report_id) { @report.id }
    let(:graph_id) { 'gJxirq8X7m' }

    before do
      ReportBuilder::SideFxReportService.new.after_update(@report, create(:admin))
    end

    get '/web_api/v1/reports/graph_data_units/published' do
      describe 'when authorized' do
        before { admin_header_token }

        example_request 'Get published data for graph' do
          assert_status 200
          expected_attrs = [{
            count_dimension_user_custom_field_values_dimension_user_id: 1,
            'dimension_user_custom_field_values.value': @gender
          }]
          expect(json_response_body.dig(:data, :attributes)).to eq(expected_attrs)
        end
      end
    end
  end
end
