# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomMaps::GeojsonLayer do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:geojson_layer)).to be_valid
    end
  end

  describe 'geojson validation' do
    it 'validates presence of geojson data' do
      layer = build(:geojson_layer)
      expect(layer).to be_valid
    end

    it 'invalidates nil geojson data' do
      layer = build(:geojson_layer, geojson: nil)
      expect(layer).to be_invalid
    end

    it 'invalidates empty geojson data' do
      layer = build(:geojson_layer, geojson: {})
      expect(layer).to be_invalid
    end
  end
end
