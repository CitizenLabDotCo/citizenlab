# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportPolicy do
  subject { described_class.new(user, report) }

  let_it_be(:all_reports) { create_list(:report, 3) }
  let_it_be(:report) { all_reports.first }

  let(:scope) { described_class::Scope.new(user, ReportBuilder::Report) }

  context 'when user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:layout) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
    it { expect(scope.resolve.count).to eq(3) }
  end

  context 'when user has moderator rights' do
    let_it_be(:user) { build(:project_moderator) }

    context 'when user owns the report' do
      let_it_be(:all_reports) { create_list(:report, 3) }
      let_it_be(:report) do
        all_reports.first.tap { |r| r.update!(owner: user) }
      end

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:layout) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:update) }
      it { expect(scope.resolve.count).to eq(1) }
    end

    context 'when user does not own the report' do
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:layout) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:update) }
      it { expect(scope.resolve.count).to eq(0) }

      context 'when report belongs to phase moderated by this user' do
        let_it_be(:all_reports) { create_list(:report, 3) }
        let_it_be(:report) do
          project = Project.find(user.moderatable_project_ids.first)
          phase = build(:phase)
          project.update!(phases: [phase])
          all_reports.first.tap { |r| r.update!(phase: phase) }
        end

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:layout) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.to permit(:update) }
        it { expect(scope.resolve.count).to eq(0) }
      end
    end
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:layout) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:layout) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }

    context 'when report belongs to phase' do
      before do
        allow(report).to receive(:phase?).and_return(true)
        allow(PhasePolicy).to receive(:new).and_return(phase_policy)
      end

      context 'when phase can be updated' do
        let(:phase_policy) { instance_double(PhasePolicy, update?: true) }

        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
      end

      context 'when phase cannot be updated' do
        let(:phase_policy) { instance_double(PhasePolicy, update?: false) }

        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
      end

      context 'when phase can be shown' do
        let(:phase_policy) { instance_double(PhasePolicy, show?: true) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:layout) }
      end

      context 'when phase cannot be shown' do
        let(:phase_policy) { instance_double(PhasePolicy, show?: false) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:layout) }
      end
    end
  end
end
