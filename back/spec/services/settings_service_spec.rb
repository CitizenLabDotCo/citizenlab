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

  describe 'admin_writable_settings' do
    it 'returns the annotated settings' do
      schema = {
        'properties' => {
          'a' => {
            'type' => 'object',
            'properties' => {
              'enabled' => { 'type' => 'boolean', 'admin_writable' => true },
              'setting1' => { 'type' => 'string' }
            }
          }
        }
      }
      expect(ss.admin_writable_settings(schema)).to eq [%w[a enabled]]
    end

    # Each setting added to (or removed from) this list widens (or narrows) what admins
    # who are not super admins can change.
    it 'lists exactly the settings admins may change in the app configuration schema' do
      expect(ss.admin_writable_settings(AppConfiguration::Settings.json_schema)).to contain_exactly(
        %w[blocking_profanity enabled],
        %w[core anonymous_name_scheme],
        %w[core area_term],
        %w[core areas_term],
        %w[core color_main],
        %w[core color_secondary],
        %w[core color_text],
        %w[core complete_your_profile_helper_text],
        %w[core country_code],
        %w[core currency],
        %w[core custom_fields_signup_helper_text],
        %w[core enter_email_helper_text],
        %w[core enter_password_helper_text],
        %w[core exclude_admins_and_moderators_from_statistics],
        %w[core locales],
        %w[core onboarding],
        %w[core organization_name],
        %w[core organization_site],
        %w[core population],
        %w[core timezone],
        %w[core topic_term],
        %w[core topics_term],
        %w[esri_integration api_key],
        %w[flag_inappropriate_content enabled]
      )
    end
  end

  describe 'changed_settings' do
    let(:before) do
      {
        'a' => { 'enabled' => true, 'name' => { 'en' => 'A', 'fr-FR' => 'A' } },
        'b' => { 'enabled' => false }
      }
    end

    it 'ignores settings whose value is unchanged' do
      expect(ss.changed_settings(before, before.deep_dup)).to be_empty
    end

    it 'returns a multiloc setting as one setting when one of its locales changes' do
      after = before.deep_merge('a' => { 'name' => { 'en' => 'B' } })
      expect(ss.changed_settings(before, after)).to eq [%w[a name]]
    end

    it 'returns new features and settings' do
      after = before.deep_merge('a' => { 'new_setting' => 1 }, 'c' => { 'enabled' => true })
      expect(ss.changed_settings(before, after)).to contain_exactly(%w[a new_setting], %w[c enabled])
    end

    it 'returns removed features and settings' do
      after = { 'a' => before['a'].except('name') }
      expect(ss.changed_settings(before, after)).to contain_exactly(%w[a name], %w[b enabled])
    end

    it 'returns a feature whose value is not a hash as a whole' do
      after = before.merge('b' => 'not a hash')
      expect(ss.changed_settings(before, after)).to eq [['b', nil]]
    end
  end
end
