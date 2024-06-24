# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_visitor_timeline_widgets_craftjs_state' do # rubocop:disable RSpec/DescribeClass
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  before do
    Rake::Task['single_use:migrate_visitor_timeline_widgets_craftjs_state'].reenable
  end

  let!(:layout) do
    create(:report_layout, craftjs_json: craftjs_json.deep_dup)
  end

  let(:craftjs_json) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => [
          'zYcSUrAyhO'
        ],
        'props' => {
          'id' => 'e2e-content-builder-frame'
        },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      'zYcSUrAyhO' => {
        'type' => {
          'resolvedName' => 'VisitorsWidget'
        },
        'nodes' => [],
        'props' => {
          'startAt' => '2024-05-01T02:00:00.000',
          'endAt' => '2024-05-30T00:00:00.000',
          'title' => { 'en' => 'Visitor timeline' },
          'projectId' => '12f28371-4bdc-4675-8de8-487df54b3c4c'
        },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'VisitorsWidget',
        'linkedNodes' => {}
      }
    }
  end

  it 'removes the projectId prop from the VisitorsWidget node' do
    Rake::Task['single_use:migrate_visitor_timeline_widgets_craftjs_state'].invoke

    expected_json = craftjs_json.tap do |json|
      json['zYcSUrAyhO']['props'].delete('projectId')
    end

    expect(layout.reload.craftjs_json).to match(expected_json)
  end

  context 'when the layout belongs to a phase report' do
    let!(:report) do
      layout.content_buildable.tap do |report|
        owner = create(:admin)
        report.update!(phase: create(:phase), owner: owner)
        ReportBuilder::ReportPublisher.new(report, owner).publish
      end
    end

    it 'refreshes the published graph data units of the report' do
      expect(report.published_graph_data_units.size).to eq(1)

      expect do
        Rake::Task['single_use:migrate_visitor_timeline_widgets_craftjs_state'].invoke
      end.to change { report.reload.published_graph_data_units.sole.id }
        .and change { report.published_graph_data_units.sole.created_at }
        # graph_id should not change since the node is updated in place
        .and not_change { report.published_graph_data_units.sole.graph_id }
    end
  end
end
