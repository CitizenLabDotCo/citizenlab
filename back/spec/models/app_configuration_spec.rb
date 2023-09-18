# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration do
  describe '.timezone' do
    let(:timezone_name) { 'Europe/Amsterdam' }

    before do
      app_config = described_class.instance
      app_config.settings['core']['timezone'] = timezone_name
      app_config.save!
    end

    it 'returns the correct timezone object' do
      expected_timezone = Time.find_zone(timezone_name)
      expect(described_class.timezone).to eq(expected_timezone)
    end
  end
end