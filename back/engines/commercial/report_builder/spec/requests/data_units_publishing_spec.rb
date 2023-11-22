# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::WebApi::V1::GraphDataUnitsController do
  let(:craftjs_jsonmultiloc) do
    {
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
  end
  let(:admin_headers) { { Authorization: authorization_header(create(:admin)) } }
  let(:user_headers) { { Authorization: authorization_header(create(:user)) } }
  let(:report) do
    create(:report, layout: build(:layout, craftjs_jsonmultiloc: craftjs_jsonmultiloc), phase_id: create(:phase).id)
  end
  let(:project) { create(:project) }
  let(:participation_date) { Date.new(2022, 9, 1) }

  let(:gender) { 'female' }

  # see back/engines/commercial/analytics/spec/acceptance/analytics_participations_spec.rb
  def build_analytics_data
    create(:dimension_date, date: participation_date)
    create(:dimension_type, name: 'idea', parent: 'post')
    create(:custom_field, key: :gender, resource_type: 'User')
    create(:idea, project: project, created_at: participation_date, author: create(:user, gender: gender))
  end

  before do
    host! 'example.org'
    build_analytics_data
  end

  it 'previews live data, publishes it, and returns published data' do
    expected_attrs = [{
      count_dimension_user_custom_field_values_dimension_user_id: 1,
      'dimension_user_custom_field_values.value': gender
    }]

    get '/web_api/v1/reports/graph_data_units/live',
      params: { resolved_name: 'GenderWidget' },
      headers: admin_headers
    expect(json_parse(response.body).dig(:data, :attributes)).to eq(expected_attrs)

    ReportBuilder::SideFxReportService.new.after_update(report, create(:admin))
    expect(ReportBuilder::PublishedGraphDataUnit.count).to eq(1)
    data_unit = ReportBuilder::PublishedGraphDataUnit.first
    expect(data_unit).to have_attributes(
      report_id: report.id,
      graph_id: 'gJxirq8X7m',
      data: expected_attrs.map(&:deep_stringify_keys)
    )

    get '/web_api/v1/reports/graph_data_units/published',
      params: { report_id: report.id, graph_id: 'gJxirq8X7m' },
      headers: user_headers
    expect(json_parse(response.body).dig(:data, :attributes)).to eq(expected_attrs)
  end
end
