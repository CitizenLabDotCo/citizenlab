# frozen_string_literal: true

# Shared examples for testing the ClaimableParticipation concern.
# Usage:
#   it_behaves_like 'claimable_participation'
RSpec.shared_examples 'claimable_participation' do
  describe 'claim_token association' do
    it { is_expected.to have_one(:claim_token).dependent(:destroy) }
  end
end
