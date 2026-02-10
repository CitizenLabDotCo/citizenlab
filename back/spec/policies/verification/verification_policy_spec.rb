# frozen_string_literal: true

require 'rails_helper'

describe Verification::VerificationPolicy do
  subject { described_class.new(user, verification) }

  let(:scope) { Verification::VerificationPolicy::Scope.new(user, Verification::Verification) }
  let!(:verification) { build(:verification) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:create) }

    it 'does not index the verification' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user on a verification of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the verification' do
      verification.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the verification' do
    let(:user) { verification.user }

    it { is_expected.to permit(:create) }

    it 'indexes the verification' do
      verification.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user that didn't complete her registration yet" do
    let(:user) { verification.user }

    before do
      user.update!(registration_completed_at: nil)
    end

    it { is_expected.to permit(:create) }

    it 'indexes the verification' do
      verification.save!
      expect(scope.resolve.size).to eq 1
    end
  end
end
