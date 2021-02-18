# frozen_string_literal: true

require 'rails_helper'

describe 'CitizenLab::Mixins::SettingsSpecification' do

  context "with settings specified as JSON" do
    let(:spec_as_json) do
      Module.new do
        def self.settings_json_schema
          {
            type: 'object',
            title: 'Feature title',
            description: 'Feature description',
            additionalProperties: false,
            required: %w[allowed enabled],
            properties: {
              allowed: { type: 'boolean', default: true },
              enabled: { type: 'boolean', default: true }
            }
          }.deep_stringify_keys
        end
      end
    end

    it 'generates the str version of the settings json-schema' do
      expect { spec_as_json.settings_json_schema_str }.to raise_error(NoMethodError)
      spec_as_json.extend(CitizenLab::Mixins::SettingsSpecification)
      expect(spec_as_json.settings_json_schema_str).to eq(spec_as_json.settings_json_schema.to_json)
    end
  end

  context "with settings specified as a string" do
    let(:spec_as_str) do
      Module.new do
        def self.settings_json_schema_str
          {
            type: 'object',
            title: 'Feature title',
            description: 'Feature description',
            additionalProperties: false,
            required: %w[allowed enabled],
            properties: {
              allowed: { type: 'boolean', default: true },
              enabled: { type: 'boolean', default: true }
            }
          }.deep_stringify_keys.to_json
        end
      end
    end

    it 'generates the str version of the settings json-schema' do
      expect { spec_as_str.settings_json_schema }.to raise_error(NoMethodError)
      spec_as_str.extend(CitizenLab::Mixins::SettingsSpecification)
      expect(spec_as_str.settings_json_schema.to_json).to eq(spec_as_str.settings_json_schema_str)
    end
  end
end
