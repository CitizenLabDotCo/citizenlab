# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::LiveGraphDataUnitPolicy do
  subject { described_class.new(user, props) }

  let_it_be(:project) { create(:project) }
  let(:props) { {} }

  context 'when user is admin' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:live) }

    context 'when project_id is present' do
      let(:props) { { project_id: project.id } }

      it { is_expected.to permit(:live) }
    end
  end

  context 'when user is moderator' do
    let_it_be(:user) { build(:project_moderator, projects: [project]) }
    let_it_be(:another_project) { create(:project) }

    # Project moderators should be able to access global project data
    # for widgets like ProjectsTimelineWidget and ProjectsWidget
    it { is_expected.to permit(:live) }

    context 'when project_id is present' do
      let(:props) { { project_id: project.id } }

      it { is_expected.to permit(:live) }
    end

    context 'when another project_id is present' do
      let(:props) { { project_id: another_project.id } }

      it { is_expected.not_to permit(:live) }
    end

    context 'when phase_id is present' do
      let_it_be(:phase) { create(:phase, project: project) }
      let(:props) { { phase_id: phase.id } }

      it { is_expected.to permit(:live) }
    end

    context 'when another phase_id is present' do
      let_it_be(:phase) { create(:phase, project: another_project) }
      let(:props) { { phase_id: phase.id } }

      it { is_expected.not_to permit(:live) }
    end
  end

  context 'when user is normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:live) }

    context 'when user is not project member' do
      before do
        allow(PhasePolicy).to receive(:new).and_return(instance_double(PhasePolicy, show?: false))
      end

      it { is_expected.not_to permit(:live) }
    end

    context 'when user is project member' do
      before do
        allow(PhasePolicy).to receive(:new).and_return(instance_double(PhasePolicy, show?: true))
      end

      it { is_expected.not_to permit(:live) }
    end
  end

  context 'when user is visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:live) }
  end
end
