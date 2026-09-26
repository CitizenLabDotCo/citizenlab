# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::SpotlightSurveyWidgetCleanupService do
  subject(:service) { described_class.new }

  let(:project) { create(:project) }
  let(:phase) { create(:phase, :standalone, project: project) }
  let(:layout) do
    ContentBuilder::Layout.find_by(
      content_buildable: project,
      code: ContentBuilder::ProjectPageLayoutService::CODE
    )
  end

  before { ContentBuilder::LayoutProvisioningService.new.provision_for(project) }

  def add_widget(survey_phase_id)
    state = ContentBuilder::Craftjs::State.new(layout.craftjs_json)
    node_id = state.add_node(
      resolved_name: 'ExtraSurveysWidget',
      parent: ContentBuilder::ProjectPageLayoutService::BODY_ID,
      props: { 'surveyPhaseId' => survey_phase_id }
    )
    layout.update!(craftjs_json: state.json)
    node_id
  end

  def widget_ids
    ContentBuilder::Craftjs::State.new(layout.reload.craftjs_json)
      .nodes_by_resolved_name('ExtraSurveysWidget')
      .keys
  end

  describe '#cleanup_moved' do
    it 'removes the widgets pointing at a phase that moved onto the timeline' do
      add_widget(phase.id)
      phase.update!(placement_type: 'on_timeline')

      service.cleanup_moved(phase)

      expect(widget_ids).to be_empty
    end

    it 'keeps widgets pointing at other phases' do
      other_phase = create(:phase, :standalone, project: project)
      kept = add_widget(other_phase.id)
      add_widget(phase.id)
      phase.update!(placement_type: 'on_timeline')

      service.cleanup_moved(phase)

      expect(widget_ids).to eq [kept]
    end

    it 'keeps the widget when the placement did not change' do
      add_widget(phase.id)
      phase.update!(title_multiloc: { 'en' => 'Renamed' })

      service.cleanup_moved(phase)

      expect(widget_ids).not_to be_empty
    end

    it 'keeps the widget when the phase moved off the timeline' do
      timeline_phase = create(:native_survey_phase, project: project)
      add_widget(timeline_phase.id)
      timeline_phase.update!(placement_type: 'standalone')

      service.cleanup_moved(timeline_phase)

      expect(widget_ids).not_to be_empty
    end
  end

  describe '#cleanup_destroyed' do
    it 'removes the widgets pointing at the deleted phase' do
      other_phase = create(:phase, :standalone, project: project)
      kept = add_widget(other_phase.id)
      add_widget(phase.id)
      phase.destroy!

      service.cleanup_destroyed(phase)

      expect(widget_ids).to eq [kept]
    end
  end

  it 'reports and moves on when the layout cannot be edited' do
    node_id = add_widget(phase.id)
    phase.update!(placement_type: 'on_timeline')
    json = layout.craftjs_json
    json[node_id]['parent'] = 'MISSING_PARENT'
    layout.update_columns(craftjs_json: json)
    expect(ErrorReporter).to receive(:report)

    expect { service.cleanup_moved(phase) }.not_to raise_error
  end

  describe 'as a side effect of the phase lifecycle' do
    it 'runs when the phase is updated' do
      add_widget(phase.id)
      phase.update!(placement_type: 'on_timeline')

      SideFxPhaseService.new.after_update(phase, create(:admin))

      expect(widget_ids).to be_empty
    end

    it 'runs when the phase is destroyed' do
      add_widget(phase.id)
      phase.destroy!

      SideFxPhaseService.new.after_destroy(phase, create(:admin))

      expect(widget_ids).to be_empty
    end
  end
end
