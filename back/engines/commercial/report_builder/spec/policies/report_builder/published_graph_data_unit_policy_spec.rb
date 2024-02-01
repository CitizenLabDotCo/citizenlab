# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::PublishedGraphDataUnitPolicy do
  subject { described_class.new(user, data_unit) }

  shared_examples 'permits if phase started' do
    context 'phase started' do
      let_it_be(:phase) { build(:phase, project: project, start_at: 1.day.ago) }
      let_it_be(:report) { build(:report, phase: phase) }
      let_it_be(:data_unit) { build(:published_graph_data_unit, report: report) }

      it { is_expected.to permit(:published) }
    end
  end

  shared_examples 'does not permit if phase not started' do
    context 'phase not started' do
      let_it_be(:phase) { build(:phase, project: project, start_at: 1.day.from_now) }
      let_it_be(:report) { build(:report, phase: phase) }
      let_it_be(:data_unit) { build(:published_graph_data_unit, report: report) }

      it { is_expected.not_to permit(:published) }
    end
  end

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

      include_examples 'permits if phase started'
      include_examples 'does not permit if phase not started'
    end
  end

  context 'when user is normal user' do
    let_it_be(:user) { build(:user) }

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

      include_examples 'permits if phase started'
      include_examples 'does not permit if phase not started'
    end
  end

  context 'when user is visitor' do
    let_it_be(:user) { nil }

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

      include_examples 'permits if phase started'
      include_examples 'does not permit if phase not started'
    end
  end
end
