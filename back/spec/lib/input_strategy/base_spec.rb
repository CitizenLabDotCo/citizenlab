# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::Base do
  let(:custom_field) { build(:custom_field_text) }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_average?' do
    it 'returns false by default' do
      expect(input_strategy.supports_average?).to be false
    end
  end
end
