# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomMaps::EsriLayer do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:esri_layer)).to be_valid
    end
  end

  describe 'layer_url validation' do
    it 'validates presence of url' do
      layer = build(:esri_layer, layer_url: 'https://some.domain.com/some_layer_1')
      expect(layer).to be_valid
    end

    it 'invalidates nil url' do
      layer = build(:esri_layer, layer_url: nil)
      expect(layer).to be_invalid
    end

    it 'invalidates empty url' do
      layer = build(:esri_layer, layer_url: '')
      expect(layer).to be_invalid
    end

    it 'validates a url starting with https://' do
      layer = build(:esri_layer, layer_url: 'https://some.domain.com/some_layer_2')
      expect(layer).to be_valid
    end

    it 'validates a url starting with http://' do
      layer = build(:esri_layer, layer_url: 'http://some.domain.com/some_layer_3')
      expect(layer).to be_valid
    end

    it 'invalidates a url starting with neither http:// or https://' do
      layer = build(:esri_layer, layer_url: 'ftp://some.domain.com/some_layer')
      expect(layer).to be_invalid
    end
  end
end
