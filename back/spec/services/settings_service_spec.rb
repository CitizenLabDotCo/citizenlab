# frozen_string_literal: true

require 'rails_helper'

describe SettingsService do
  let(:ss) { described_class.new }
  let(:schema1) do
    {
      'properties' => {
        'a' => {},
        'b' => {},
        'c' => {
          properties: {
            allowed: { type: 'boolean', default: true },
            enabled: { type: 'boolean', default: false }
          }
        }
      },
      'dependencies' => {
        'b' => ['a'],
        'c' => %w[a b]
      }
    }.deep_stringify_keys
  end

  describe 'add_missing_features' do
    it 'adds the missing features to empty settings' do
      settings = ss.add_missing_features({}, schema1)
      expect(settings).to include('a', 'b', 'c')
    end

    it 'adds missing features to existing settings' do
      settings = ss.add_missing_features({ a: {} }, schema1)
      expect(settings).to include('a', 'b', 'c')
    end

    it 'sets missing features to unallowed and unenabled' do
      settings = ss.add_missing_features({}, schema1)
      expect(settings['a']).to include({
        'allowed' => false,
        'enabled' => false
      })
    end

    it 'sets missing feature allowed/enabled to their default values' do
      settings = ss.add_missing_features({}, schema1)
      expect(settings['c']).to include({
        'allowed' => true,
        'enabled' => false
      })
    end

    it 'leaves features not in the schema unchanged' do
      settings_ext = { 'd' => {} }
      settings = ss.add_missing_features(settings_ext, schema1)
      expect(settings).to include('d')
    end
  end

  describe 'add_missing_settings' do
    let(:schema) do
      {
        'properties' => {
          'feature1' => {
            'required-settings' => %w[setting1 setting2 setting4],
            'properties' => {
              'setting1' => {
                'type' => 'string',
                'default' => 'default_value_setting_1'
              },
              'setting2' => {
                'type' => 'boolean',
                'default' => true
              },
              'setting3' => {
                'type' => 'string'
              },
              'setting4' => {
                'type' => 'boolean',
                'default' => false
              }
            }
          }
        }
      }
    end

    it 'adds required settings with a default' do
      settings = {
        'feature1' => {}
      }
      expected_settings = {
        'feature1' => {
          'setting1' => 'default_value_setting_1',
          'setting2' => true,
          'setting4' => false
        }
      }
      expect(ss.add_missing_settings(settings, schema)).to eq expected_settings
    end

    it "doesn't change existing settings" do
      settings = {
        'feature1' => {
          'setting1' => 'non-default',
          'setting2' => false,
          'setting3' => 'somevalue',
          'setting4' => true
        }
      }
      expect(ss.add_missing_settings(settings, schema)).to eq settings
    end
  end

  describe 'missing_dependencies' do
    it 'is empty on an empty settings' do
      expect(ss.missing_dependencies({}, schema1)).to be_empty
    end

    it 'is empty on met dependencies' do
      settings = {
        'a' => { 'allowed' => true, 'enabled' => true },
        'b' => { 'allowed' => true, 'enabled' => true }
      }
      expect(ss.missing_dependencies(settings, schema1)).to be_empty
    end

    it 'contains missing disabled dependency' do
      settings = {
        'a' => { 'allowed' => true, 'enabled' => false },
        'b' => { 'allowed' => true, 'enabled' => true }
      }
      expect(ss.missing_dependencies(settings, schema1)).to eq ['a']
    end

    it 'contains disallowed dependency' do
      settings = {
        'a' => { 'allowed' => false, 'enabled' => true },
        'b' => { 'allowed' => true, 'enabled' => true }
      }
      expect(ss.missing_dependencies(settings, schema1)).to eq ['a']
    end
  end

  describe 'remove_additional_features' do
    it 'leaves schema features alone' do
      settings = {
        'a' => {},
        'b' => { 'allowed' => false, 'enabled' => true }
      }
      expect(ss.remove_additional_features(settings, schema1)).to eq settings
    end

    it 'removes features not in the schema' do
      settings = {
        'a' => { 'allowed' => false, 'enabled' => true },
        'd' => { 'allowed' => true, 'enabled' => true }
      }
      expect(ss.remove_additional_features(settings, schema1)).to eq settings.except('d')
    end
  end

  describe 'remove_additional_settings' do
    let(:schema) do
      {
        'type' => 'object',
        'properties' => {
          'a' => {
            'type' => 'object',
            'properties' => {
              'setting1' => { 'type' => 'boolean' },
              'setting2' => { 'type' => 'string' }
            }
          }
        }
      }
    end

    it 'leaves schema settings alone' do
      settings = {
        'a' => { 'settings1' => true, 'setting2' => 'yes' }
      }
      expect(ss.remove_additional_settings(settings, schema)).to eq settings
    end

    it 'removes settings not in the schema' do
      settings = {
        'a' => { 'setting1' => true, 'setting2' => 'yes', 'setting3' => 'not in there' }
      }
      expected_settings = {
        'a' => { 'setting1' => true, 'setting2' => 'yes' }
      }
      expect(ss.remove_additional_settings(settings, schema)).to eq expected_settings
    end
  end

  describe 'format_for_front_end' do
    let(:schema) do
      {
        'type' => 'object',
        'properties' => {
          'a' => {
            'type' => 'object',
            'properties' => {
              'setting1' => { 'type' => 'boolean' },
              'setting2' => { 'type' => 'string', 'private' => true }
            }
          }
        }
      }
    end

    it 'leaves non-private schema settings alone' do
      settings = {
        'a' => { 'settings1' => true }
      }
      expect(ss.format_for_front_end(settings, schema)).to eq settings
    end

    it 'removes private settings' do
      settings = {
        'a' => { 'settings1' => true, 'setting2' => 'something' }
      }
      expected_settings = {
        'a' => { 'settings1' => true }
      }
      expect(ss.format_for_front_end(settings, schema)).to eq expected_settings
    end
  end

  describe 'disable_verification_if_no_methods_enabled' do
    it 'disables verification if there are no methods enabled' do
      settings = {
        'verification' => {
          'allowed' => true,
          'enabled' => true
        }
      }

      updated_settings = ss.send(:disable_verification_if_no_methods_enabled, settings)
      expect(updated_settings['verification']['enabled']).to be false
    end

    it 'disables verification if all methods are hidden from the profile' do
      settings = {
        'verification' => {
          'allowed' => true,
          'enabled' => true,
          'verification_methods' => [
            {
              'name' => 'nemlog_in',
              'hide_from_profile' => true
            },
            {
              'name' => 'keycloak',
              'hide_from_profile' => true
            }
          ]
        }
      }

      updated_settings = ss.send(:disable_verification_if_no_methods_enabled, settings)
      expect(updated_settings['verification']['enabled']).to be false
    end

    it 'does not disable verification if at least one method is NOT hidden from the profile' do
      settings = {
        'verification' => {
          'allowed' => true,
          'enabled' => true,
          'verification_methods' => [
            {
              'name' => 'nemlog_in'
            },
            {
              'name' => 'keycloak',
              'hide_in_profile' => true
            }
          ]
        }
      }

      updated_settings = ss.send(:disable_verification_if_no_methods_enabled, settings)
      expect(updated_settings['verification']['enabled']).to be true
    end
  end
end
