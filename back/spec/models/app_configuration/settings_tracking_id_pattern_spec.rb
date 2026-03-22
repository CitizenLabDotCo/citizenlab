# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  describe 'settings schema tracking_id pattern' do
    let(:schema) do
      schema_filepath = Rails.root.join('config/schemas/settings.schema.json.erb')
      JSON.parse(ERB.new(File.read(schema_filepath)).result(binding))
    end
    let(:tracking_id_pattern) do
      Regexp.new(schema.dig('properties', 'google_analytics', 'properties', 'tracking_id', 'pattern'))
    end

    it 'matches valid UA tracking IDs' do
      expect(tracking_id_pattern).to match('UA-12345-1')
      expect(tracking_id_pattern).to match('UA-123456789-12')
    end

    it 'matches valid YT tracking IDs' do
      expect(tracking_id_pattern).to match('YT-12345-1')
    end

    it 'matches valid MO tracking IDs' do
      expect(tracking_id_pattern).to match('MO-12345-1')
    end

    it 'rejects invalid tracking IDs' do
      expect(tracking_id_pattern).not_to match('GA-12345-1')
      expect(tracking_id_pattern).not_to match('UA12345-1')
      expect(tracking_id_pattern).not_to match('UA-12345')
      expect(tracking_id_pattern).not_to match('random-string')
    end
  end
end
