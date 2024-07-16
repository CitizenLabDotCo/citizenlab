# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'hoplr authentication' do
  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:hoplr] = OmniAuth::AuthHash.new(
      {
        'provider' => 'hoplr',
        'uid' => '602119',
        'info' => {
          'name' => 'Alexander CitizenLab',
          'email' => 'alexander@citizenlab.co',
          'email_verified' => nil,
          'nickname' => nil,
          'first_name' => 'Alexander',
          'last_name' => 'CitizenLab',
          'gender' => nil,
          'image' => 'https://devhoplrstorage.blob.core.windows.net/images/defaultuser.jpg',
          'phone' => nil,
          'urls' => { 'website' => nil }
        },
        'credentials' => {
          'id_token' => 'xxx',
          'token' => 'xxx',
          'refresh_token' => nil,
          'expires_in' => 3600,
          'scope' => 'openid email profile'
        },
        'extra' => {
          'raw_info' => {
            'sub' => '602119',
            'email' => 'alexander@citizenlab.co',
            'family_name' => 'CitizenLab',
            'given_name' => 'Alexander',
            'iss' => 'https://test.hoplr.com/',
            'aud' => 'ncW9xxxxxxxxxx&Ko3wDJ',
            'neighbourhood' => '2133',
            'oi_au_id' => '2ae1e1e0-0000-4bd5-9317-374e6c82cf23',
            'name' => 'Alexander CitizenLab',
            'picture' => 'https://devhoplrstorage.blob.core.windows.net/images/defaultuser.jpg',
            'locale' => 'en',
            'azp' => 'ncW9xxxxxxxxxx&Ko3wDJ',
            'nonce' => 'bba2590000000000eeb5e6f1f2c43d93',
            'at_hash' => 'NXoxxxxxxxxxxZ8kGx2INg',
            'oi_tkn_id' => '5eef5151-0000-4577-82a4-0f9fb3296dd9',
            'exp' => 1_701_442_629,
            'iat' => 1_701_441_429
          }
        }
      }
    )

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['hoplr_login'] = {
      allowed: true,
      enabled: true,
      environment: 'test',
      client_id: 'fakeid',
      client_secret: 'fakesecret',
      neighbourhood_custom_field_key: 'neighbourhood'
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_have_attributes(user)
    expect(user.identities.first).to have_attributes({
      provider: 'hoplr',
      user_id: user.id,
      uid: '602119'
    })
    expect(user).to have_attributes({
      verified: false,
      first_name: 'Alexander',
      last_name: 'CitizenLab',
      email: 'alexander@citizenlab.co',
      locale: 'en',
      custom_field_values: {
        'neighbourhood' => '2133'
      }
    })
  end

  it 'successfully authenticates new user' do
    get '/auth/hoplr?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/en/complete-signup?random-passthrough-param=somevalue')

    expect_user_to_have_attributes(User.last)
    expect(cookies[:cl2_jwt]).to be_present
  end

  context 'when user already exists' do
    let!(:user) { create(:user, email: 'alexander@citizenlab.co') }

    it 'successfully authenticates and updates existing user' do
      get '/auth/hoplr'
      follow_redirect!

      expect_user_to_have_attributes(user.reload)
    end
  end
end
