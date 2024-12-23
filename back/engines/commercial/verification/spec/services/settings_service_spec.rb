# frozen_string_literal: true

require 'rails_helper'

describe SettingsService do
  let(:ss) { described_class.new }

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
