# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportPolicy do
  subject { described_class.new(user, report) }

  let(:scope) { described_class::Scope.new(user, ReportBuilder::Report) }

  let_it_be(:project) { create(:project) }
  let_it_be(:another_project) { create(:project) }

  let_it_be(:current_phase) { create(:phase, project: project, start_at: 1.day.ago, end_at: 1.day.from_now) }
  let_it_be(:future_phase) { create(:phase, project: project, start_at: 2.days.from_now) }

  shared_examples 'permitted everything' do
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:layout) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:copy) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
  end

  shared_examples 'not permitted anything' do
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:layout) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:copy) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
  end

  context 'when user has admin rights' do
    let_it_be(:all_reports) { create_list(:report, 3) }
    let_it_be(:report) { all_reports.first }
    let_it_be(:user) { build(:admin) }

    it_behaves_like 'permitted everything'
    it { expect(scope.resolve.count).to eq(3) }
  end

  context 'when user has moderator rights' do
    let_it_be(:user) { build(:project_moderator) }
    let_it_be(:all_reports) { create_list(:report, 3) }
    let_it_be(:report) { all_reports.first }

    context 'when report does not belong to a phase' do
      context 'when user did not create report' do
        it_behaves_like 'not permitted anything'
        it { expect(scope.resolve.count).to eq(0) }
      end

      context 'when user did create report' do
        let_it_be(:project2) { create(:project) }
        let_it_be(:layout) do
          create(:layout, craftjs_json: {
            ROOT: {
              type: 'div',
              props: {}
            },
            visitors_widget: {
              type: {
                resolvedName: 'VisitorsWidget'
              },
              props: {
                projectId: project2.id
              }
            },
            most_reacted_ideas: {
              type: {
                resolvedName: 'MostReactedIdeasWidget'
              },
              props: {
                phaseId: current_phase.id
              }
            }
          })
        end

        context 'when user cannot access any data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [another_project]) }
          let_it_be(:report) { create(:report, owner: user, layout: layout) }

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:copy) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(1) }
        end

        context 'when user cannot access all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project]) }
          let_it_be(:report) { create(:report, owner: user, layout: layout) }

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:copy) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(1) }
        end

        context 'when user can access all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project, project2]) }
          let_it_be(:report) { create(:report, owner: user, layout: layout) }

          it_behaves_like 'permitted everything'
          it { expect(scope.resolve.count).to eq(1) }
        end
      end
    end

    context 'when report belongs to phase' do
      let_it_be(:layout) do
        create(:layout, craftjs_json: {
          ROOT: {
            type: 'div',
            props: {}
          },
          visitors_widget: {
            type: {
              resolvedName: 'VisitorsWidget'
            },
            props: {
              projectId: another_project.id
            }
          }
        })
      end

      context 'phase not started' do
        context 'when user can moderate phase, and has access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project, another_project]) }
          let_it_be(:report) { create(:report, phase: future_phase, layout: layout) }

          it_behaves_like 'permitted everything'
        end

        context 'when user can moderate phase, but does not have access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project]) }
          let_it_be(:report) { create(:report, phase: future_phase, layout: layout) }

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:copy) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
        end

        context 'when user cannot moderate phase' do
          let_it_be(:user) { create(:project_moderator) }
          let_it_be(:report) { create(:report, phase: future_phase, layout: layout) }

          it_behaves_like 'not permitted anything'
        end
      end

      context 'phase started' do
        context 'when user can moderate phase, but does not have access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            create(
              :report,
              :visible,
              phase: current_phase,
              layout: layout
            )
          end

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:copy) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end

        context 'when user cannot moderate phase, and report is visible' do
          let_it_be(:user) { create(:project_moderator) }
          let_it_be(:report) do
            create(
              :report,
              :visible,
              phase: current_phase,
              layout: layout
            )
          end

          it { is_expected.not_to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:copy) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end

        context 'when user cannot moderate phase, and report is not visible' do
          let_it_be(:user) { create(:project_moderator) }
          let_it_be(:report) do
            create(:report, phase: current_phase, layout: layout)
          end

          it_behaves_like 'not permitted anything'
          it { expect(scope.resolve.count).to eq(0) }
        end
      end
    end
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    context 'when report does not belong to phase' do
      let_it_be(:report) { create(:report) }

      it_behaves_like 'not permitted anything'
      it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
    end

    context 'when visitors cannot see phase' do
      let_it_be(:project) { create(:project, visible_to: 'groups') }
      let_it_be(:phase) { create(:phase, project: project) }
      let_it_be(:report) { create(:report, :visible, phase: phase) }

      it_behaves_like 'not permitted anything'
      it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
    end

    context 'when visitors can see phase' do
      context 'phase not started' do
        let_it_be(:report) { create(:report, :visible, phase: future_phase) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:layout) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:copy) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:update) }
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end

      context 'phase started and report visible' do
        let_it_be(:report) { create(:report, :visible, phase: current_phase) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.to permit(:layout) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:copy) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:update) }
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end

      context 'phase started and report not visible' do
        let_it_be(:report) { create(:report, phase: current_phase) }

        it_behaves_like 'not permitted anything'
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end
    end
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    context 'when report does not belong to phase' do
      let_it_be(:report) { create(:report) }

      it_behaves_like 'not permitted anything'
      it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
    end

    context 'when report belongs to phase' do
      context 'phase not started' do
        let_it_be(:report) { create(:report, :visible, phase: future_phase) }

        it_behaves_like 'not permitted anything'
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end

      context 'phase started and report visible' do
        let_it_be(:report) { create(:report, :visible, phase: current_phase) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.to permit(:layout) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:copy) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:update) }
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end

      context 'phase started and report not visible' do
        let_it_be(:report) { create(:report, phase: current_phase) }

        it_behaves_like 'not permitted anything'
        it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
      end
    end
  end
end
