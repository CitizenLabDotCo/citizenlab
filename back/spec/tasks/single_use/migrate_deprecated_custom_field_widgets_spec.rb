# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_deprecated_custom_field_widgets' do # rubocop:disable RSpec/DescribeClass
  before(:all) do # rubocop:disable RSpec/BeforeAfterAll
    task_path = 'tasks/single_use/20240601_migrate_deprecated_custom_field_widgets'
    Rake.application.rake_require(task_path)
    Rake::Task.define_task(:environment)
  end

  # Ensure the required custom fields exist
  let_it_be(:birthyear_cf) { create(:custom_field_birthyear) }
  let_it_be(:gender_cf) { create(:custom_field_gender) }

  before do
    Rake::Task['single_use:migrate_deprecated_custom_field_widgets'].reenable
  end

  let(:craftjs_json) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => %w[08OC4-ZDgc Ve2_h93h5f],
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      '08OC4-ZDgc' => {
        'type' => { 'resolvedName' => 'GenderWidget' },
        'nodes' => [],
        'props' => {
          'endAt' => '2024-05-30T00:00:00.000',
          'title' => { 'en' => 'Users by gender' },
          'startAt' => '2023-10-30T01:00:00.000',
          'projectId' => '40562cd4-9379-48e0-81ce-769c30041090'
        },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'GenderWidget',
        'linkedNodes' => {}
      },
      'Ve2_h93h5f' => {
        'type' => { 'resolvedName' => 'AgeWidget' },
        'nodes' => [],
        'props' => {
          'endAt' => '2024-05-30T00:00:00.000',
          'title' => { 'en' => 'Users by age' },
          'startAt' => '2024-01-29T01:00:00.000',
          'projectId' => '40562cd4-9379-48e0-81ce-769c30041090'
        },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'AgeWidget',
        'linkedNodes' => {}
      }
    }
  end

  context 'when several layouts have GenderWidget and AgeWidget widgets' do
    let!(:age_gender_layout) do
      create(:report_layout, craftjs_json: craftjs_json.deep_dup)
    end

    let!(:age_layout) do
      state = ContentBuilder::Craftjs::State.new(craftjs_json.deep_dup)
      state.delete_node('08OC4-ZDgc')
      create(:report_layout, craftjs_json: state.json)
    end

    let!(:gender_layout) do
      state = ContentBuilder::Craftjs::State.new(craftjs_json.deep_dup)
      state.delete_node('Ve2_h93h5f')
      create(:report_layout, craftjs_json: state.json)
    end

    it 'converts all widgets to DemographicsWidget' do
      expect do
        Rake::Task['single_use:migrate_deprecated_custom_field_widgets'].invoke
      end.to change { ContentBuilder::Layout.with_widget_type('GenderWidget').count }.by(-2)
        .and change { ContentBuilder::Layout.with_widget_type('AgeWidget').count }.by(-2)
        .and change { ContentBuilder::Layout.with_widget_type('DemographicsWidget').count }.by(3)

      expect(gender_layout.reload.craftjs_json['08OC4-ZDgc']).to match(
        craftjs_json['08OC4-ZDgc'].deep_dup.tap do |json|
          json['type']['resolvedName'] = 'DemographicsWidget'
          json['displayName'] = 'DemographicsWidget'
          json['props']['customFieldId'] = gender_cf.id
        end
      )

      expect(age_layout.reload.craftjs_json['Ve2_h93h5f']).to match(
        craftjs_json['Ve2_h93h5f'].deep_dup.tap do |json|
          json['type']['resolvedName'] = 'DemographicsWidget'
          json['displayName'] = 'DemographicsWidget'
          json['props']['customFieldId'] = birthyear_cf.id
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
        Rake::Task['single_use:migrate_deprecated_custom_field_widgets'].invoke
      end.to change { report.reload.published_graph_data_units.ids.to_set }
        .and change { report.published_graph_data_units.pluck(:created_at).to_set }
        # graph_ids should not change since the nodes are updated in place
        .and not_change { report.published_graph_data_units.pluck(:graph_id).to_set }
    end
  end
end
