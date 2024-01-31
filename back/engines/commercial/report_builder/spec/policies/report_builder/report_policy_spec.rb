# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportPolicy do
  subject { described_class.new(user, report) }

  let(:scope) { described_class::Scope.new(user, ReportBuilder::Report) }

  context 'when user has admin rights' do
    let_it_be(:all_reports) { create_list(:report, 3) }
    let_it_be(:report) { all_reports.first }
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
    let_it_be(:all_reports) { create_list(:report, 3) }
    let_it_be(:report) { all_reports.first }

    context 'when report does not belong to a phase' do
      context 'when user did not create report' do
        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:layout) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:update) }
        it { expect(scope.resolve.count).to eq(0) }
      end

      context 'when user did create report' do
        let_it_be(:project1) { create(:project) }
        let_it_be(:project2) { create(:project) }
        let_it_be(:phase) {  create(:phase, project: project2) }
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
                projectId: project1.id
              }
            },
            most_reacted_ideas: {
              type: {
                resolvedName: 'MostReactedIdeasWidget'
              },
              props: {
                phaseId: phase.id
              }
            }
          })
        end

        context 'when user cannot access any data in report' do
          let_it_be(:another_project) { create(:project) }
          let_it_be(:user) { create(:project_moderator, projects: [another_project]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(owner: user, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(1) }
        end

        context 'when user cannot access all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project1]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(owner: user, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(1) }
        end

        context 'when user can access all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project1, project2]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(owner: user, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.to permit(:create) }
          it { is_expected.to permit(:destroy) }
          it { is_expected.to permit(:update) }
          it { expect(scope.resolve.count).to eq(1) }
        end
      end
    end

    context 'when report belongs to phase' do
      let_it_be(:project) { create(:project) }
      let_it_be(:another_project) { create(:project) }
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
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.from_now) }

        context 'when user can moderate phase, and has access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project, another_project]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(phase: phase, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.to permit(:create) }
          it { is_expected.to permit(:destroy) }
          it { is_expected.to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end

        context 'when user can moderate phase, but does not have access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(phase: phase, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end

        context 'when user cannot moderate phase' do
          let_it_be(:user) { create(:project_moderator) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(phase: phase, layout: layout)
            end
          end

          it { is_expected.not_to permit(:show) }
          it { is_expected.not_to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end
      end

      context 'phase started' do
        let_it_be(:phase) { create(:phase, project: project, start_at: 1.day.ago) }

        context 'when user can moderate phase, but does not have access to all data in report' do
          let_it_be(:user) { create(:project_moderator, projects: [project]) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(phase: phase, layout: layout)
            end
          end

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end

        context 'when user cannot moderate phase' do
          let_it_be(:user) { create(:project_moderator) }
          let_it_be(:all_reports) { create_list(:report, 3) }
          let_it_be(:report) do
            all_reports.first.tap do |r|
              r.update!(phase: phase, layout: layout)
            end
          end

          it { is_expected.not_to permit(:show) }
          it { is_expected.to permit(:layout) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:destroy) }
          it { is_expected.not_to permit(:update) }
          it { expect(scope.resolve.count).to eq(0) }
        end
      end
    end

    # context 'when user owns the report' do
    #   let_it_be(:all_reports) { create_list(:report, 3) }
    #   let_it_be(:report) do
    #     all_reports.first.tap { |r| r.update!(owner: user) }
    #   end

    #   it { is_expected.to permit(:show) }
    #   it { is_expected.to permit(:layout) }
    #   it { is_expected.to permit(:create) }
    #   it { is_expected.to permit(:destroy) }
    #   it { is_expected.to permit(:update) }
    #   it { expect(scope.resolve.count).to eq(1) }
    # end

    # context 'when user does not own the report' do
    #   it { is_expected.not_to permit(:show) }
    #   it { is_expected.not_to permit(:layout) }
    #   it { is_expected.not_to permit(:create) }
    #   it { is_expected.not_to permit(:destroy) }
    #   it { is_expected.not_to permit(:update) }
    #   it { expect(scope.resolve.count).to eq(0) }

    #   context 'when report belongs to phase moderated by this user' do
    #     let_it_be(:all_reports) { create_list(:report, 3) }
    #     let_it_be(:report) do
    #       project = Project.find(user.moderatable_project_ids.first)
    #       phase = build(:phase)
    #       project.update!(phases: [phase])
    #       all_reports.first.tap { |r| r.update!(phase: phase) }
    #     end

    #     it { is_expected.to permit(:show) }
    #     it { is_expected.to permit(:layout) }
    #     it { is_expected.to permit(:create) }
    #     it { is_expected.to permit(:destroy) }
    #     it { is_expected.to permit(:update) }
    #     it { expect(scope.resolve.count).to eq(0) }
    #   end
    # end
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }
    let_it_be(:all_reports) { create_list(:report, 3) }
    let_it_be(:report) { all_reports.first }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:layout) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    context 'when report does not belong to phase' do
      let_it_be(:all_reports) { create_list(:report, 3) }
      let_it_be(:report) { all_reports.first }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:layout) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:update) }
      it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
    end

    # context 'when report belongs to phase' do
    #   let_it_be(:project) { create(:project) }
    #   let_it_be(:phase) { create(:phase, project: project) }

    #   before do
    #     allow(report).to receive(:phase?).and_return(true)
    #     allow(PhasePolicy).to receive(:new).and_return(phase_policy)
    #   end

    #   # TODO
    # end
  end
end
