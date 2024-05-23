# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Permissions::ReportPermissionsService do
  let(:phase) { create(:phase) }
  let(:phase_id) { phase.id }
  let(:project_id) { phase.project.id }

  let(:report) do
    layout = build(:layout, craftjs_json: {
      ROOT: {},
      '5Hk6BOKxfJ' => {
        'type' => { 'resolvedName' => 'SurveyQuestionResultWidget' },
        'nodes' => [],
        'props' => { 'phaseId' => phase_id, 'projectId' => project_id, 'questionId' => '' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'i6qbawCoDc',
        'isCanvas' => false,
        'displayName' => 'SurveyQuestionResultWidget',
        'linkedNodes' => {}
      }
    })
    create(:report, layout: layout, phase: phase)
  end

  context 'when admin' do
    let(:user) { create(:admin) }

    it 'returns no error' do
      expect(described_class.new.editing_disabled_reason_for_report(report, user)).to be_nil
    end
  end

  context 'when normal user' do
    let(:user) { create(:user) }

    it 'returns no error' do
      expect(described_class.new.editing_disabled_reason_for_report(report, user)).to eq('report_has_unauthorized_data')
    end
  end

  context 'when moderator' do
    let(:user) { create(:user) }

    context 'when user is moderator of project used in widget' do
      before { user.add_role 'project_moderator', project_id: project_id }

      it 'returns no error' do
        expect(described_class.new.editing_disabled_reason_for_report(report, user)).to be_nil
      end

      context 'when phase_is is not configured in widget' do
        let(:phase_id) { nil }

        it 'returns no error' do
          expect(described_class.new.editing_disabled_reason_for_report(report, user)).to be_nil
        end
      end

      context 'when phase was deleted' do
        before do
          report # create report
          phase.destroy # and then delete phase
        end

        it 'returns no error' do
          expect(described_class.new.editing_disabled_reason_for_report(report, user)).to be_nil
        end
      end

      context 'when project is not configured in widget' do
        let(:project_id) { nil }

        it 'returns error' do
          expect(described_class.new.editing_disabled_reason_for_report(report, user)).to eq('report_has_unauthorized_data')
        end
      end
    end

    context 'when user is moderator of another project' do
      before { user.add_role 'project_moderator', project_id: create(:project).id }

      it 'returns error' do
        expect(described_class.new.editing_disabled_reason_for_report(report, user)).to eq('report_has_unauthorized_data')
      end

      context 'when phase_is is not configured on widget' do
        let(:phase_id) { nil }

        it 'returns error' do
          expect(described_class.new.editing_disabled_reason_for_report(report, user)).to eq('report_has_unauthorized_data')
        end
      end
    end
  end
end
