# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Phase do
  describe 'setup reviews' do
    it 'accepts known cards' do
      expect(build(:phase, reviewed_setup_cards: Phase::SETUP_REVIEW_CARDS)).to be_valid
    end

    it 'rejects unknown cards and non-array values' do
      [%w[unknown], 'input_term', nil].each do |value|
        phase = build(:phase, reviewed_setup_cards: value)
        expect(phase).not_to be_valid
        expect(phase.errors.of_kind?(:reviewed_setup_cards, :invalid)).to be true
      end
    end
  end
end
