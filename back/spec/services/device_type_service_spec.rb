# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeviceTypeService do
  describe '.device_type' do
    def device_type(user_agent)
      described_class.device_type(Browser.new(user_agent))
    end

    it 'is mobile for a phone' do
      expect(device_type('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' \
                         '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')).to eq 'mobile'
    end

    it 'is tablet for a tablet' do
      expect(device_type('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' \
                         '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')).to eq 'tablet'
    end

    it 'is desktop_or_other otherwise' do
      expect(device_type('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'))
        .to eq 'desktop_or_other'
    end
  end
end
