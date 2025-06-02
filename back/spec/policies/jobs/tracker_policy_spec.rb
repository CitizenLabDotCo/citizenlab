# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jobs::TrackerPolicy do
  describe 'policy' do
    subject { described_class.new(user, job_tracker) }

    let_it_be(:job_tracker) { create(:jobs_tracker, :with_phase_context) }

    context 'for a visitor' do
      let_it_be(:user) { nil }

      it { is_expected.not_to permit(:show) }
    end

    context 'for a resident' do
      let_it_be(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
    end

    context 'for a moderator' do
      context "when user is a moderator of the job's project" do
        let_it_be(:user) { create(:project_moderator, projects: [job_tracker.project]) }

        it { is_expected.to permit(:show) }
      end

      context "when user is not a moderator of the job's project" do
        let_it_be(:user) { create(:project_moderator) }

        it { is_expected.not_to permit(:show) }
      end
    end

    context 'for an admin' do
      let_it_be(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
    end
  end

  describe 'scope`' do
    subject { described_class::Scope.new(user, Jobs::Tracker).resolve }

    before_all do
      @with_context = create(:jobs_tracker, :with_phase_context)

      @all_trackers = [
        @with_context,
        create(:jobs_tracker, :with_owner, :with_phase_context),
        create(:jobs_tracker)
      ]
    end

    context 'for visitor' do
      let(:user) { nil }

      it { is_expected.to be_empty }
    end

    context 'for user' do
      let(:user) { create(:user) }

      it { is_expected.to be_empty }
    end

    context 'for project moderator' do
      let(:user) { create(:project_moderator, projects: [@with_context.project]) }

      its(:ids) { is_expected.to match_array [@with_context.id] }
    end

    context 'for admin' do
      let(:user) { create(:admin) }

      its(:ids) { is_expected.to match_array(@all_trackers.map(&:id)) }
    end
  end
end
