# frozen_string_literal: true

require 'rails_helper'

describe IdeaVotePolicy do
  subject(:policy) { described_class.new(user, vote) }

  let(:scope) { IdeaVotePolicy::Scope.new(user, Vote) }
  let(:project) { create(:continuous_project) }
  let(:votable) { create(:idea, project: project) }
  let!(:vote) { create(:vote, votable: votable) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the vote' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user on a vote of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the vote' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the vote' do
    let(:user) { vote.user }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:up) }
    it { is_expected.to permit(:down) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for blocked vote owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:vote) { create(:vote, user: user, votable: votable) }

    it_behaves_like 'policy for blocked user vote'
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the vote on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }
    let!(:vote) { create(:vote, votable: idea, user: user) }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the vote on an idea in a project where voting is disabled' do
    let!(:user) { create(:user) }
    let!(:project) { create(:continuous_project, voting_enabled: false) }
    let!(:idea) { create(:idea, project: project) }
    let!(:vote) { create(:vote, votable: idea, user: user) }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
