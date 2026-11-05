# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::Keycloak::KeycloakOmniauth do
  let(:keycloak_method) { described_class.new }
  let(:app_configuration) { AppConfiguration.instance }
  let(:options) { {} }
  let(:env) { { 'omniauth.strategy' => instance_double(OmniAuth::Strategies::OpenIDConnect, options: options) } }

  def configure_keycloak(provider:)
    settings = app_configuration.settings
    settings['id_config'] = {
      'allowed' => true,
      'enabled' => true,
      'id_methods' => [{
        'name' => 'keycloak',
        'provider' => provider,
        'issuer' => 'https://some.test.domain.com/auth/realms/example-realm',
        'client_id' => '12345',
        'client_secret' => '78910'
      }]
    }
    app_configuration.save!
  end

  describe 'omniauth_setup' do
    # Regression: the rheinbahn provider is authentication-only (verification?
    # is false for it). A guard based on VerificationService#active? would bail
    # before populating client_options, and the OpenIDConnect strategy would
    # then crash with `AttrRequired::AttrMissing: 'identifier' required.`.
    it 'sets the client identifier for the authentication-only rheinbahn provider' do
      configure_keycloak(provider: 'rheinbahn')

      keycloak_method.omniauth_setup(app_configuration, env)

      expect(keycloak_method.verification?).to be false
      expect(options[:client_options]).to include(
        identifier: '12345',
        secret: '78910'
      )
    end

    it 'sets the client identifier for the idporten provider' do
      configure_keycloak(provider: 'idporten')

      keycloak_method.omniauth_setup(app_configuration, env)

      expect(keycloak_method.verification?).to be true
      expect(options[:client_options]).to include(
        identifier: '12345',
        secret: '78910'
      )
    end

    it 'does nothing when keycloak is not configured' do
      keycloak_method.omniauth_setup(app_configuration, env)

      expect(options).to be_empty
    end
  end
end
