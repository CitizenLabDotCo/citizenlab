# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reaction do
  context 'associations' do
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to belong_to(:reactable) }
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:reaction)).to be_valid
    end
  end

  context 'uniquness' do
    it "can't create 2 reactions for the same reactable and user" do
      idea = create(:idea)
      user = create(:user)
      create(:reaction, reactable: idea, user: user)
      expect(build(:reaction, mode: 'up', reactable: idea, user: user)).not_to be_valid
      # Must be valid to be able to turn like into dislike in transaction
      expect(build(:reaction, mode: 'down', reactable: idea, user: user)).to be_valid
      expect { create(:reaction, mode: 'down', reactable: idea, user: user) }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'two reactions of deleted users are allowed' do
      idea = create(:idea)
      u1 = create(:user)
      v1 = create(:reaction, reactable: idea, user: u1)
      u2 = create(:user)
      v2 = create(:reaction, reactable: idea, user: u2)
      u1.destroy!
      u2.destroy!
      expect(v1.reload).to be_valid
      expect(v2.reload).to be_valid
    end
  end

  # TO DO: Remove this TDD test
  describe 'scope: linked_to_verification_hashed_uids' do
    let(:reaction1) { create(:reaction) }
    let!(:reactions_verifications_hashed_uid1) do
      create(:reactions_verifications_hashed_uid,
        reaction: reaction1,
        verification_hashed_uid: '111')
    end
    let!(:reactions_verifications_hashed_uid2) do
      create(:reactions_verifications_hashed_uid,
        reaction: reaction1,
        verification_hashed_uid: '222')
    end

    let(:reaction2) { create(:reaction) }
    let!(:reactions_verifications_hashed_uid3) do
      create(:reactions_verifications_hashed_uid,
        reaction: reaction2,
        verification_hashed_uid: '333')
    end

    it 'returns reactions associated with given verifications_hashed_uids' do
      expect(described_class.linked_to_verification_hashed_uids(%w[111 333])).to match_array([reaction1, reaction2])
      expect(described_class.linked_to_verification_hashed_uids(['222'])).to match_array([reaction1])
    end
  end
end
