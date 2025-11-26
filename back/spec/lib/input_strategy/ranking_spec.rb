# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::Ranking do
  let(:custom_field) { build(:custom_field_ranking) }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_options?' do
    it 'returns true' do
      expect(input_strategy.supports_options?).to be true
    end
  end
end
