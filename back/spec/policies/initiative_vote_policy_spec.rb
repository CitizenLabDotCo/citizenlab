# frozen_string_literal: true

require 'rails_helper'

describe InitiativeVotePolicy do
  subject(:policy) { described_class.new(user, vote) }

  let(:scope) { InitiativeVotePolicy::Scope.new(user, Vote) }
  let(:votable) { create(:initiative) }
  let!(:vote) { create(:vote, votable: votable) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should not index the vote' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user on a vote of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should not index the vote' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the vote' do
    let(:user) { vote.user }

    it { is_expected.to     permit(:show) }
    it { is_expected.to     permit(:create) }
    it { is_expected.to     permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.to permit(:destroy) }

    it 'should index the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should index the vote' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
