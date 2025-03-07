# frozen_string_literal: true

require 'rails_helper'

describe CommentReactionPolicy do
  subject(:policy) { described_class.new(user, reaction) }

  let(:scope) { CommentReactionPolicy::Scope.new(user, Reaction) }
  let(:project) { create(:single_phase_ideation_project) }
  let(:idea) { create(:idea, project: project, phases: project.phases) }
  let(:comment) { create(:comment, idea: idea) }

  context 'for a visitor' do
    let!(:reaction) { create(:reaction, reactable: comment) }
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
    let!(:reaction) { create(:reaction, reactable: comment) }
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
    let!(:reaction) { create(:reaction, reactable: comment) }
    let(:user) { reaction.user }

    it { is_expected.to     permit(:show) }
    it { is_expected.to     permit(:create) }
    it { is_expected.to     permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.to     permit(:destroy) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for blocked reaction owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:reaction) { create(:reaction, user: user, reactable: comment) }

    it_behaves_like 'policy for blocked user reaction'
  end

  context 'for an admin on a reaction of another user' do
    let!(:reaction) { create(:reaction, reactable: comment) }
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

  context 'for a mortal user who owns the reaction on a private project' do
    let(:project) { create(:private_admins_project) }
    let!(:reaction) { create(:reaction, reactable: comment) }
    let(:user) { reaction.user }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'does not index the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the reaction on a project where commenting is disabled' do
    let(:project) { create(:single_phase_ideation_project, phase_attrs: { commenting_enabled: false }) }
    let!(:reaction) { create(:reaction, reactable: comment) }
    let(:user) { reaction.user }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the reaction on a project where commenting is only allowed by admins' do
    let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }
    let!(:reaction) { create(:reaction, reactable: comment) }
    let(:user) { reaction.user }

    before do
      project.phases.first.permissions
        .find_by(action: 'commenting_idea')
        .update!(permitted_by: 'admins_moderators')
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
