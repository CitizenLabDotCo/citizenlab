# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::MultiselectImage do
  let(:custom_field) { build(:custom_field_multiselect_image) }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_options?' do
    it 'returns true' do
      expect(input_strategy.supports_options?).to be true
    end
  end

  describe '#supports_other_option?' do
    it 'returns true' do
      expect(input_strategy.supports_other_option?).to be true
    end
  end

  describe '#supports_option_images?' do
    it 'returns true' do
      expect(input_strategy.supports_option_images?).to be true
    end
  end
end
