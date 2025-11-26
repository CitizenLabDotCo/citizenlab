# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::Point do
  let(:custom_field) { build(:custom_field, input_type: 'point') }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_xlsx_export?' do
    it 'returns false' do
      expect(input_strategy.supports_xlsx_export?).to be false
    end
  end

  describe '#supports_geojson?' do
    it 'returns true' do
      expect(input_strategy.supports_geojson?).to be true
    end
  end
end
