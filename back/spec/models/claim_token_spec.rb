# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClaimToken do
  subject(:claim_token) { build(:claim_token) }

  describe 'factory' do
    it 'is valid' do
      # Use create because presence validation, in this case on +item_id+, does not work
      # well with associations.
      expect(create(:claim_token)).to be_valid
    end
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:token) }
    it { is_expected.to validate_uniqueness_of(:token) }
    it { is_expected.to validate_presence_of(:item_type) }
    it { is_expected.to validate_inclusion_of(:item_type).in_array(%w[Idea]) }
    it { is_expected.to validate_presence_of(:item_id) }
    it { is_expected.to validate_presence_of(:expires_at) }
  end

  describe 'attribute defaults' do
    let(:idea) { create(:idea, author: nil) }

    it 'generates a random token on creation' do
      claim_token = create(:claim_token)
      expect(claim_token.token).to be_present
    end

    # same but freeze time
    it 'sets expiry to 24 hours from now' do
      freeze_time do
        claim_token = create(:claim_token)
        expect(claim_token.expires_at).to eq(24.hours.from_now)
      end
    end
  end

  describe 'scopes' do
    describe '.expired' do
      it 'returns only expired tokens' do
        expired = create(:claim_token, :expired)
        valid_token = create(:claim_token)

        expect(described_class.expired).to include(expired)
        expect(described_class.expired).not_to include(valid_token)
      end
    end

    describe '.for_user' do
      it 'returns pending tokens for a specific user' do
        user = create(:user)
        other_user = create(:user)
        pending_for_user = create_list(:claim_token, 2, pending_claimer: user)
        pending_for_other = create(:claim_token, pending_claimer: other_user)
        _not_pending = create(:claim_token) # should not be included in scopes

        expect(described_class.for_user(user)).to match_array(pending_for_user)
        expect(described_class.for_user(other_user)).to contain_exactly(pending_for_other)
      end
    end
  end

  describe '#expired?' do
    it 'returns true for expired tokens' do
      claim_token = create(:claim_token, :expired)
      expect(claim_token.expired?).to be true
    end

    it 'returns false for valid tokens' do
      claim_token = create(:claim_token)
      expect(claim_token.expired?).to be false
    end
  end
end
