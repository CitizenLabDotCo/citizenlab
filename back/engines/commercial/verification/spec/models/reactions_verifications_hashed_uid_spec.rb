# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Verification::ReactionsVerificationsHashedUid do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:reactions_verifications_hashed_uid)).to be_valid
    end
  end
end
