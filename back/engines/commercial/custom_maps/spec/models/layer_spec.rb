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
end
