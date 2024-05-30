# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_visitor_timeline_widgets_craftjs_state' do # rubocop:disable RSpec/DescribeClass
  before(:all) do # rubocop:disable RSpec/BeforeAfterAll
    task_path = 'tasks/single_use/20240530_migrate_visitor_timeline_widgets_craftjs_state'
    Rake.application.rake_require(task_path)
    Rake::Task.define_task(:environment)
  end

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
end
