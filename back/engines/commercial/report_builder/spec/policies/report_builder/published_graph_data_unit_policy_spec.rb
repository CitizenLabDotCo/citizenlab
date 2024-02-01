# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::PublishedGraphDataUnitPolicy do
  subject { described_class.new(user, data_unit) }

  let_it_be(:project) { create(:project) }
  let_it_be(:phase) { create(:phase, project: project) }
  let_it_be(:report) { create(:report, phase: phase) }
  let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

  context 'when user is admin' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:published) }
  end

  context 'when user is moderator' do
    context 'when user can moderate project' do
      let_it_be(:user) { build(:project_moderator, projects: [project]) }
      it { is_expected.to permit(:published) }
    end

    context 'when user cannot moderate project' do
      let_it_be(:user) { build(:project_moderator) }

      context 'phase not started' do
        let_it_be(:project) { create(:project) }
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.from_now) }
        let_it_be(:report) { create(:report, phase: phase) }
        let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

        it { is_expected.not_to permit(:published) }
      end

      context 'phase started' do
        let_it_be(:project) { create(:project) }
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.ago) }
        let_it_be(:report) { create(:report, phase: phase) }
        let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

        it { is_expected.to permit(:published) }
      end
    end
  end

  context 'when user is normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.to permit(:published) }

    context 'when user is not project member' do
      before do
        allow(PhasePolicy).to receive(:new).and_return(instance_double(PhasePolicy, show?: false))
      end

      it { is_expected.not_to permit(:published) }
    end

    context 'when user is project member' do
      before do
        allow(PhasePolicy).to receive(:new).and_return(instance_double(PhasePolicy, show?: true))
      end

      context 'phase not started' do
        let_it_be(:project) { create(:project) }
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.from_now) }
        let_it_be(:report) { create(:report, phase: phase) }
        let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

        it { is_expected.not_to permit(:published) }
      end

      context 'phase started' do
        let_it_be(:project) { create(:project) }
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.ago) }
        let_it_be(:report) { create(:report, phase: phase) }
        let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

        it { is_expected.to permit(:published) }
      end
    end
  end

  context 'when user is visitor' do
    let_it_be(:user) { nil }

    it { is_expected.to permit(:published) }
  end

  context 'when phase has not started' do
    before { allow(phase).to receive(:started?).and_return(false) }

    it 'does not permit :published for any user' do
      [
        build(:admin),
        build(:project_moderator, projects: [project]),
        build(:user),
        nil
      ].each do |user|
        subject = described_class.new(user, data_unit)
        expect(subject).not_to permit(:published)
      end
    end
  end
end
