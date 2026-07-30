# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::AllowedCountries do
  include_context 'with sms feature enabled'

  describe '.allowed?' do
    it 'allows any country when no allow-list is configured' do
      expect(described_class.allowed?('BE')).to be(true)
    end

    context 'with an allow-list configured' do
      before do
        SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => %w[BE FR] })
      end

      it 'allows a country that is on the list' do
        expect(described_class.allowed?('BE')).to be(true)
      end

      it 'rejects a country that is not on the list' do
        expect(described_class.allowed?('US')).to be(false)
      end
    end

    context 'with an empty allow-list' do
      before do
        SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => [] })
      end

      it 'allows any country' do
        expect(described_class.allowed?('US')).to be(true)
      end
    end
  end
end
