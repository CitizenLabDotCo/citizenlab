# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::Rating do
  let(:custom_field) { build(:custom_field_rating) }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_average?' do
    it 'returns true' do
      expect(input_strategy.supports_average?).to be true
    end
  end

  describe '#supports_linear_scale_labels?' do
    it 'returns false' do
      expect(input_strategy.supports_linear_scale_labels?).to be false
    end
  end
end
