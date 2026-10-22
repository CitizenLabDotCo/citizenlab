# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'okta authentication' do
  let(:email_verified) { true }
  let(:auth_hash) do
    {
      'provider' => 'okta',
      'uid' => '00u1a2b3c4d5e6f7g8h9',
      'info' => {
        'name' => 'Jordan Rivera',
        'email' => 'jordan.rivera@example.gov',
        'email_verified' => email_verified,
        'nickname' => 'jordan.rivera@example.gov',
        'first_name' => 'Jordan',
        'last_name' => 'Rivera'
      },
      'credentials' => {
        'id_token' => 'fake_id_token',
        'token' => 'fake_token',
        'expires_in' => 3600,
        'scope' => 'openid email profile'
      },
      'extra' => {
        'raw_info' => {
          'sub' => '00u1a2b3c4d5e6f7g8h9',
          'iss' => 'https://example.okta.com',
          'email' => 'jordan.rivera@example.gov',
          'email_verified' => email_verified,
          'given_name' => 'Jordan',
          'family_name' => 'Rivera',
          'locale' => 'en-US',
          'preferred_username' => 'jordan.rivera@example.gov'
        }
      }
    }
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:okta] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['core']['locales'] = %w[nl-BE en]
    settings['id_config'] = {
      allowed: true,
      enabled: true,
      id_methods: [
        {
          name: 'okta',
          issuer: 'https://example.okta.com',
          client_id: 'fakeid',
          client_secret: 'fakesecret',
          login_mechanism_name: 'Example Okta',
          visibility: 'link'
        }
      ]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully authenticates a new user' do
    get '/auth/okta?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/en/?random-passthrough-param=somevalue&sso_flow=signup&sso_success=true')

    user = User.last
    expect(user.identities.first).to have_attributes(
      provider: 'okta',
      user_id: user.id,
      uid: '00u1a2b3c4d5e6f7g8h9'
    )
    expect(user).to have_attributes(
      first_name: 'Jordan',
      last_name: 'Rivera',
      email: 'jordan.rivera@example.gov',
      locale: 'en',
      verified: false
    )
    expect(user.confirmation_required?).to be(false)
    expect(cookies[:cl2_jwt]).to be_present
  end

  context 'when the email is not verified' do
    let(:email_verified) { false }

    it 'requires email confirmation' do
      get '/auth/okta'
      follow_redirect!

      expect(User.last.confirmation_required?).to be(true)
    end
  end

  it 'does not persist the credentials in the identity' do
    get '/auth/okta'
    follow_redirect!

    expect(User.last.identities.first.auth_hash).not_to have_key('credentials')
  end

  context 'when okta is not configured for the tenant' do
    before do
      OmniAuth.config.test_mode = false

      configuration = AppConfiguration.instance
      configuration.settings['id_config']['id_methods'] = []
      configuration.save!
    end

    after { OmniAuth.config.test_mode = true }

    it 'redirects to the auth failure page instead of erroring' do
      get '/auth/okta'

      expect(response).to have_http_status(:redirect)
      expect(response.location).to include('/auth/failure')
    end
  end
end
