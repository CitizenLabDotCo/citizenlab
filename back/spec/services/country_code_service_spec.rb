# frozen_string_literal: true

require 'rails_helper'

describe CountryCodeService do
  let(:service) { described_class.new }

  describe 'get_country_code' do
    it 'returns the country code for a given lat and lng' do
      lat = 52.52
      lng = 13.405
      country_code = service.get_country_code(lat, lng)

      expect(country_code).to eq 'DE'
    end

    it 'returns the country code if given strings for lat and lng' do
      lat = '52.52'
      lng = '13.405'
      country_code = service.get_country_code(lat, lng)

      expect(country_code).to eq 'DE'
    end

    it 'returns nil if lat is nil' do
      lat = nil
      lng = 13.405
      country_code = service.get_country_code(lat, lng)

      expect(country_code).to be_nil
    end

    it 'returns nil if lng is nil' do
      lat = 52.52
      lng = nil
      country_code = service.get_country_code(lat, lng)

      expect(country_code).to be_nil
    end
  end
end
