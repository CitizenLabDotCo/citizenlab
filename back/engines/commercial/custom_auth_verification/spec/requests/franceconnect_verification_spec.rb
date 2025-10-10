# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'franceconnect verification' do
  let(:auth_hash) do
    { 'provider' => 'franceconnect',
      'uid' => 'cfdbc2447d7a579dd48bc67e43ef44a03c208cb8c218450168cfc3ba89f502f6v1',
      'info' =>
        { 'name' => nil,
          'email' => 'wossewodda-3728@yopmail.com',
          'nickname' => '',
          'first_name' => 'Angela Claire Louise',
          'last_name' => 'DUBOIS',
          'gender' => 'female',
          'image' => nil,
          'phone' => nil,
          'urls' => { 'website' => nil } },
      'credentials' =>
        { 'id_token' =>
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2ZjcC5pbnRlZzAxLmRldi1mcmFuY2Vjb25uZWN0LmZyIiwic3ViIjoiY2ZkYmMyNDQ3ZDdhNTc5ZGQ0OGJjNjdlNDNlZjQ0YTAzYzIwOGNiOGMyMTg0NTAxNjhjZmMzYmE4OWY1MDJmNnYxIiwiYXVkIjoiMGI4YmEwZjlhMjNmMTZiY2JkODZjNzgzYjJhNDFmZDBjZWYwZWE5NjhlMjUzNzM0ZGU3MWY2NDFlMGU2NjA1NyIsImV4cCI6MTU3MzczMTMxOSwiaWF0IjoxNTczNzMxMjU5LCJub25jZSI6ImE1ZjgwOWM1MTQ0MTVkMDEyMGRjNmJkZGRiZTgxMWYwIiwiaWRwIjoiRkMiLCJhY3IiOiJlaWRhczEiLCJhbXIiOm51bGx9.sa9WM_VBsMb0Rku6KTg6Pk90UBmP46bnOABojcw0cYM',
          'token' => '535a2da9-98a9-4888-8c0a-fea052b51f04',
          'refresh_token' => nil,
          'expires_in' => 60,
          'scope' => nil },
      'extra' =>
        { 'raw_info' =>
            { 'sub' =>
                'cfdbc2447d7a579dd48bc67e43ef44a03c208cb8c218450168cfc3ba89f502f6v1',
              'given_name' => 'Angela Claire Louise',
              'family_name' => 'DUBOIS',
              'gender' => 'female',
              'birthdate' => '1962-08-24',
              'preferred_username' => '',
              'email' => 'wossewodda-3728@yopmail.com',
              'address' =>
                { 'country' => 'France',
                  'formatted' => 'France Paris 75107 20 avenue de Ségur',
                  'locality' => 'Paris',
                  'postal_code' => '75107',
                  'street_address' => '20 avenue de Ségur' } } } }
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:franceconnect] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        {
          name: 'franceconnect',
          environment: 'integration',
          version: 'v2',
          identifier: 'fakeid',
          secret: 'fakesecret',
          scope: %w[given_name family_name email]
        }
      ]
    }
    configuration.save!
    host! 'example.org'

    # The FranceConnect test users almost all use the yopmail.com domain,
    # which is in our spam domain blacklist. So we stub out the email domain
    # blacklist validation in these tests.
    allow_any_instance_of(User).to receive(:validate_email_domain_blacklist)
  end

  it 'successfully authenticates and verifies a new user' do
    get '/auth/franceconnect?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/fr-FR/?random-passthrough-param=somevalue&sso_flow=signup&sso_success=true')

    user = User.find_by(email: 'wossewodda-3728@yopmail.com')

    expect(user).to have_attributes({
      verified: true,
      first_name: 'Angela Claire Louise',
      last_name: 'Dubois'
    })
    expect(user.identities.first).to have_attributes({
      provider: 'franceconnect',
      user_id: user.id
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'franceconnect',
      user_id: user.id,
      active: true,
      hashed_uid: '84d610ebae19b5e09aa5621e006746c4cd568bec352e1d98d48643e6765a82e7'
    })
    expect(cookies[:cl2_jwt]).to be_present
  end

  it 'successfully verifies an existing user' do
    user = create(:user, first_name: 'Jean', last_name: 'Dupont')
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    get "/auth/franceconnect?sso_verification=true&token=#{token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?sso_verification=true&random-passthrough-param=somevalue&verification_success=true')
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Angela Claire Louise',
      last_name: 'Dubois'
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'franceconnect',
      user_id: user.id,
      active: true
    })
  end

  it 'successfully authenticates a user that was previously authenticated and updates the auth_hash' do
    get '/auth/franceconnect'
    follow_redirect!
    user = User.order(created_at: :asc).last
    expect(user.identities.first).to have_attributes({
      provider: 'franceconnect',
      user_id: user.id
    })
    expect(user.identities.first.auth_hash['info']['gender']).to eq 'female'

    # Change the auth hash so we can check that is is updated
    auth_hash['info']['gender'] = 'male'
    OmniAuth.config.mock_auth[:franceconnect] = OmniAuth::AuthHash.new(auth_hash)

    get '/auth/franceconnect'
    follow_redirect!
    expect(user.identities.first.auth_hash['info']['gender']).to eq 'male'
  end
end
