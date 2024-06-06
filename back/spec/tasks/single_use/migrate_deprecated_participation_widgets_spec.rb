# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_deprecated_participation_widgets' do # rubocop:disable RSpec/DescribeClass
  before_all do
    task_path = 'tasks/single_use/20240601_migrate_deprecated_participation_widgets'
    Rake.application.rake_require(task_path)
    Rake::Task.define_task(:environment)

    _non_affected_layout = create(:layout, craftjs_json: { 'ROOT' => { 'type' => 'div' } })
  end

  before do
    Rake::Task['single_use:migrate_deprecated_participation_widgets'].reenable
  end

  let(:craftjs_json) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => %w[bgNC2VhGfS UVjy7eQJmb],
        'props' => {
          'id' => 'e2e-content-builder-frame'
        },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      'bgNC2VhGfS' => {
        'type' => { 'resolvedName' => 'CommentsByTimeWidget' },
        'nodes' => [],
        'props' => {
          'endAt' => '2024-05-30T00:00:00.000',
          'title' => { 'en' => 'Comments' },
          'startAt' => '2024-05-02T02:00:00.000',
          'projectId' => '40562cd4-9379-48e0-81ce-769c30041090'
        },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'CommentsByTimeWidget',
        'linkedNodes' => {}
      },
      'UVjy7eQJmb' => {
        'type' => { 'resolvedName' => 'PostsByTimeWidget' },
        'nodes' => [],
        'props' => {
          'endAt' => '2024-05-30T00:00:00.000',
          'title' => { 'en' => 'Inputs' },
          'startAt' => '2023-02-26T01:00:00.000',
          'projectId' => '40562cd4-9379-48e0-81ce-769c30041090'
        },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'PostsByTimeWidget',
        'linkedNodes' => {}
      }
    }
  end

  context "when several layouts have 'CommentsByTimeWidget' and 'PostsByTimeWidget' widgets" do
    let!(:posts_comments_layout) { create(:layout, craftjs_json: craftjs_json) }

    let!(:posts_layout) do
      state = ContentBuilder::Craftjs::State.new(craftjs_json.deep_dup)
      state.delete_node('bgNC2VhGfS')
      create(:layout, craftjs_json: state.json)
    end

    let!(:comments_layout) do
      state = ContentBuilder::Craftjs::State.new(craftjs_json.deep_dup)
      state.delete_node('UVjy7eQJmb')
      create(:layout, craftjs_json: state.json)
    end

    it 'converts all widgets to ParticipationWidget' do
      expect do
        Rake::Task['single_use:migrate_deprecated_participation_widgets'].invoke
      end.to change { ContentBuilder::Layout.with_widget_type('CommentsByTimeWidget').count }.by(-2)
        .and change { ContentBuilder::Layout.with_widget_type('PostsByTimeWidget').count }.by(-2)
        .and change { ContentBuilder::Layout.with_widget_type('ParticipationWidget').count }.by(3)

      expect(posts_comments_layout.reload.craftjs_json['bgNC2VhGfS']).to match(
        craftjs_json['bgNC2VhGfS'].deep_dup.tap do |json|
          json['type']['resolvedName'] = 'ParticipationWidget'
          json['displayName'] = 'ParticipationWidget'
          json['props'].merge!(
            'hideStatistics' => true,
            'participationTypes' => { 'inputs' => false, 'comments' => true, 'votes' => false }
          )
        end
      )

      expect(posts_layout.reload.craftjs_json['UVjy7eQJmb']).to match(
        craftjs_json['UVjy7eQJmb'].deep_dup.tap do |json|
          json['type']['resolvedName'] = 'ParticipationWidget'
          json['displayName'] = 'ParticipationWidget'
          json['props'].merge!(
            'hideStatistics' => true,
            'participationTypes' => { 'inputs' => true, 'comments' => false, 'votes' => false }
          )
        end
      )
    end
  end

  context 'when the layout belongs to a phase report' do
    let!(:report) do
      create(
        :report,
        :with_phase,
        owner: create(:admin),
        layout: create(:report_layout, craftjs_json: craftjs_json.deep_dup)
      ).tap do |report|
        # We must create the report that the layout refers to in order to publish it.
        create(:project).update!(id: '40562cd4-9379-48e0-81ce-769c30041090')
        ReportBuilder::ReportPublisher.new(report, report.owner).publish
      end
    end

    it 'refreshes the graph data units of the report' do
      expect(report.published_graph_data_units.count).to eq(2)

      expect do
        Rake::Task['single_use:migrate_deprecated_participation_widgets'].invoke
      end.to change { report.reload.published_graph_data_units.ids }
        .and change { report.published_graph_data_units.pluck(:created_at).to_set }
        # graph_ids should not change since the nodes are updated in place
        .and not_change { report.published_graph_data_units.pluck(:graph_id).to_set }
    end
  end
end
