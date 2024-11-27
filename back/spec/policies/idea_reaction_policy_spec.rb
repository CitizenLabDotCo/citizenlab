# frozen_string_literal: true

require 'rails_helper'

describe IdeaReactionPolicy do
  subject(:policy) { described_class.new(user, reaction) }

  let(:scope) { IdeaReactionPolicy::Scope.new(user, Reaction) }
  let(:project) { create(:single_phase_ideation_project, phase_attrs: { reacting_dislike_enabled: true }) }
  let(:reactable) { create(:idea, project: project, phases: project.phases) }
  let!(:reaction) { create(:reaction, reactable: reactable) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the reaction' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user on a reaction of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the reaction' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the reaction' do
    let(:user) { reaction.user }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:up) }
    it { is_expected.to permit(:down) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for blocked reaction owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:reaction) { create(:reaction, user: user, reactable: reactable) }

    it_behaves_like 'policy for blocked user reaction'
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the reaction on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }
    let!(:reaction) { create(:reaction, reactable: idea, user: user) }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the reaction on an idea in a project where reacting is disabled' do
    let!(:user) { create(:user) }
    let!(:project) { create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: false }) }
    let!(:idea) { create(:idea, project: project) }
    let!(:reaction) { create(:reaction, reactable: idea, user: user) }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the reaction on an idea in a project where reacting is not permitted' do
    let!(:user) { create(:user) }
    let!(:idea) { create(:idea, project: project) }
    let!(:reaction) { create(:reaction, reactable: idea, user: user) }
    let!(:project) do
      create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }).tap do |project|
        project.phases.first.permissions.find_by(action: 'reacting_idea')
          .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
