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
          'name' => 'Alejandro de CitizenLab',
          'email' => 'alejandro@citizenlab.co',
          'email_verified' => nil,
          'nickname' => nil,
          'first_name' => nil,
          'last_name' => nil,
          'gender' => nil,
          'image' => nil,
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
            'email' => 'alejandro@citizenlab.co',
            'iss' => 'https://test.hoplr.com/',
            'aud' => 'ncW9MwpSxxxdh5&Ko3wDJ',
            'oi_au_id' => '69c0b378-xxxx-40ea-adc7-61449ae34d60',
            'name' => 'Alejandro de CitizenLab',
            'role' => 'User',
            'azp' => 'ncW9Mwpxxxtdh5&Ko3wDJ',
            'nonce' => '9b68944e34406aa6007ee2d4e000083c',
            'at_hash' => '6kRGQBCXXXXrDCwMLohXKA',
            'oi_tkn_id' => '60cd647a-xxxx-40c0-9743-2d10bc051605',
            'exp' => 1_691_493_755,
            'iat' => 1_691_492_555
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
      client_secret: 'fakesecret'
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
      first_name: 'Alejandro',
      last_name: 'de CitizenLab',
      email: 'alejandro@citizenlab.co'
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
    let!(:user) { create(:user, email: 'alejandro@citizenlab.co') }

    it 'successfully authenticates and updates existing user' do
      get '/auth/hoplr'
      follow_redirect!

      expect_user_to_have_attributes(user.reload)
    end
  end
end
