# frozen_string_literal: true

require 'rails_helper'

describe InitiativeReactionPolicy do
  subject(:policy) { described_class.new(user, reaction) }

  let(:scope) { InitiativeReactionPolicy::Scope.new(user, Reaction) }
  let(:reactable) { create(:initiative) }
  let!(:reaction) { create(:reaction, reactable: reactable) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should not index the reaction' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user on a reaction of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should not index the reaction' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the reaction' do
    let(:user) { reaction.user }

    it { is_expected.to     permit(:show) }
    it { is_expected.to     permit(:create) }
    it { is_expected.to     permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.to permit(:destroy) }

    it 'should index the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for blocked reaction owner' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:reaction) { create(:reaction, user: user, reactable: reactable) }

    it_behaves_like 'policy for blocked user reaction', down_authorized: false
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:up) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:destroy) }

    it 'should index the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for user with verification associated with reaction' do
    let(:user) { create(:user) }
    let(:verification) { create(:verification, user: user) }

    context 'when reaction has no associated user' do
      let!(:reaction) { create(:reaction, user: nil, reactable: reactable) }
      let!(:reactions_verifications_hashed_uid) do
        create(
          :reactions_verifications_hashed_uid,
          reaction: reaction,
          verification_hashed_uid: verification.hashed_uid
        )
      end

      it { is_expected.to permit(:destroy) }

      # What about indexing?
    end

    context 'when reaction is associated with other user' do
      let!(:reaction) { create(:reaction, user: create(:user), reactable: reactable) }
      let!(:reactions_verifications_hashed_uid) do
        create(
          :reactions_verifications_hashed_uid,
          reaction: reaction,
          verification_hashed_uid: verification.hashed_uid
        )
      end

      it { is_expected.not_to permit(:destroy) }

      # What about indexing?
    end
  end
end
