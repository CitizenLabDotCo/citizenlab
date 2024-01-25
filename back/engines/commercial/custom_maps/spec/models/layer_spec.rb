# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomMaps::Layer do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:layer)).to be_valid
    end
  end

  describe 'marker_svg_url https:// validation' do
    it 'validates a url starting with https://' do
      layer = build(:layer, marker_svg_url: 'https://some.icon.svg')
      expect(layer).to be_valid
    end

    it 'invalidates a url starting with http://' do
      layer = build(:layer, marker_svg_url: 'http://some.icon.svg')
      expect(layer).to be_invalid
    end
  end

  describe 'layer_type validation' do
    it 'validates a layer_type of geojson' do
      layer = build(:layer, layer_type: 'geojson')
      expect(layer).to be_valid
    end

    it 'validates a layer_type of esri_feature_service' do
      layer = build(:layer, layer_type: 'esri_feature_service')
      expect(layer).to be_valid
    end

    it 'invalidates a invalid layer_type' do
      layer = build(:layer, layer_type: 'invalid_layer_type')
      expect(layer).to be_invalid
    end
  end

  describe 'url validation' do
    it 'validates a url starting with https://' do
      layer = build(:layer, url: 'https://some.domain.com/some_layer')
      expect(layer).to be_valid
    end

    it 'validates a url starting with http://' do
      layer = build(:layer, url: 'http://some.domain.com/some_layer')
      expect(layer).to be_valid
    end

    it 'invalidates a url starting with neither http:// or https://' do
      layer = build(:layer, url: 'ftp://some.domain.com/some_layer')
      expect(layer).to be_invalid
    end
  end

  describe 'when layer_type is geojson' do
    it 'validates presence of geojson data' do
      layer = build(:layer) # layer_type: 'geojson', with valid layer.geojson is default factory
      expect(layer).to be_valid
    end

    it 'invalidates nil geojson data' do
      layer = build(:layer, layer_type: 'geojson', geojson: nil)
      expect(layer).to be_invalid
    end

    it 'invalidates empty geojson data' do
      layer = build(:layer, layer_type: 'geojson', geojson: {})
      expect(layer).to be_invalid
    end
  end

  describe 'when layer_type is NOT geojson' do
    it 'validates presence of url' do
      layer = build(:layer, layer_type: 'esri_feature_service', url: 'https://some.domain.com/some_layer')
      expect(layer).to be_valid
    end

    it 'invalidates nil url' do
      layer = build(:layer, layer_type: 'esri_feature_service', url: nil)
      expect(layer).to be_invalid
    end

    it 'invalidates empty url' do
      layer = build(:layer, layer_type: 'esri_feature_service', url: '')
      expect(layer).to be_invalid
    end
  end
end
