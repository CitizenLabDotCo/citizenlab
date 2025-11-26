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

  describe '#supports_options?' do
    it 'returns false by default' do
      expect(input_strategy.supports_options?).to be false
    end
  end

  describe '#supports_other_option?' do
    it 'returns false by default' do
      expect(input_strategy.supports_other_option?).to be false
    end
  end

  describe '#supports_option_images?' do
    it 'returns false by default' do
      expect(input_strategy.supports_option_images?).to be false
    end
  end

  describe '#supports_follow_up?' do
    it 'returns false by default' do
      expect(input_strategy.supports_follow_up?).to be false
    end
  end

  describe '#supports_free_text_value?' do
    it 'returns false by default for fields without text support' do
      expect(input_strategy.supports_free_text_value?).to be false
    end
  end

  describe '#supports_xlsx_export?' do
    it 'returns true by default' do
      expect(input_strategy.supports_xlsx_export?).to be true
    end
  end

  describe '#supports_geojson?' do
    it 'returns false by default' do
      expect(input_strategy.supports_geojson?).to be false
    end
  end

  describe '#supports_linear_scale?' do
    it 'returns false by default' do
      expect(input_strategy.supports_linear_scale?).to be false
    end
  end

  describe '#supports_linear_scale_labels?' do
    it 'returns false by default' do
      expect(input_strategy.supports_linear_scale_labels?).to be false
    end
  end
end
