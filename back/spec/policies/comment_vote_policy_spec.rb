# frozen_string_literal: true

require 'rails_helper'

describe CommentVotePolicy do
  subject(:policy) { described_class.new(user, vote) }

  let(:scope) { CommentVotePolicy::Scope.new(user, Vote) }
  let(:project) { create(:continuous_project) }
  let(:idea) { create(:idea, project: project) }
  let(:comment) { create(:comment, post: idea) }

  context 'for a visitor' do
    let!(:vote) { create(:vote, votable: comment) }
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
    let!(:vote) { create(:vote, votable: comment) }
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
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { is_expected.to     permit(:show) }
    it { is_expected.to     permit(:create) }
    it { is_expected.to     permit(:up) }
    it { is_expected.not_to permit(:down) }
    it { is_expected.to     permit(:destroy) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for blocked vote owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:vote) { create(:vote, user: user, votable: comment) }

    it_behaves_like 'policy for blocked user vote'
  end

  context 'for an admin on a vote of another user' do
    let!(:vote) { create(:vote, votable: comment) }
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

  context 'for a mortal user who owns the vote on a private project' do
    let(:project) { create(:private_admins_project) }
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'does not index the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the vote on a project where commenting is disabled' do
    let(:project) { create(:project, commenting_enabled: false) }
    let!(:vote) { create(:vote, votable: comment) }
    let(:user) { vote.user }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:down) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
