# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'publik authentication' do
  let(:email_verified) { true }
  let(:auth_hash) do
    {
      'provider' => 'publik',
      'uid' => '9f1c2f30d1b94a0e9f2f0b7a1c3d4e5f',
      'info' => {
        'name' => 'Camille Dubois',
        'email' => 'camille.dubois@example.fr',
        'email_verified' => email_verified,
        'nickname' => 'camille',
        'first_name' => 'Camille',
        'last_name' => 'Dubois'
      },
      'credentials' => {
        'id_token' => 'fake_id_token',
        'token' => 'fake_token',
        'expires_in' => 3599,
        'scope' => 'openid email profile'
      },
      'extra' => {
        'raw_info' => {
          'sub' => '9f1c2f30d1b94a0e9f2f0b7a1c3d4e5f',
          'iss' => 'https://connexion.meyzieu.fr/',
          'email' => 'camille.dubois@example.fr',
          'email_verified' => email_verified,
          'given_name' => 'Camille',
          'family_name' => 'Dubois',
          'preferred_username' => 'camille'
        }
      }
    }
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:publik] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['core']['locales'] = %w[en fr-FR]
    settings['id_config'] = {
      allowed: true,
      enabled: true,
      id_methods: [
        {
          name: 'publik',
          issuer: 'https://connexion.meyzieu.fr/',
          client_id: 'fakeid',
          client_secret: 'fakesecret',
          ui_method_name: 'Connexion Meyzieu'
        }
      ]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully authenticates a new user' do
    get '/auth/publik?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/fr-FR/?random-passthrough-param=somevalue&sso_flow=signup&sso_success=true')

    user = User.last
    expect(user.identities.first).to have_attributes(
      provider: 'publik',
      user_id: user.id,
      uid: '9f1c2f30d1b94a0e9f2f0b7a1c3d4e5f'
    )
    expect(user).to have_attributes(
      first_name: 'Camille',
      last_name: 'Dubois',
      email: 'camille.dubois@example.fr',
      locale: 'fr-FR',
      verified: false
    )
    expect(user.confirmation_required?).to be(false)
    expect(cookies[:cl2_jwt]).to be_present
  end

  context 'when the email is not verified' do
    let(:email_verified) { false }

    it 'requires email confirmation' do
      get '/auth/publik'
      follow_redirect!

      expect(User.last.confirmation_required?).to be(true)
    end
  end

  it 'does not persist the credentials in the identity' do
    get '/auth/publik'
    follow_redirect!

    expect(User.last.identities.first.auth_hash).not_to have_key('credentials')
  end
end
