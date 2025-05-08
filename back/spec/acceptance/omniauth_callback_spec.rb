# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Omniauth Callback', document: false do
  before { header 'Content-Type', 'application/json' }

  post '/auth/failure' do
    example_request 'Redirect to failure URL' do
      expect(status).to eq(302)
      expect(response_headers['Location']).to include('authentication_error=true')
    end
  end

  context 'when the user is logged in' do
    before do
      @user = create(:user)
    end

    parameter :user_id, 'User ID', required: true

    let(:user_id) { @user.id }

    get '/auth/clave_unica/logout_data' do
      example_request 'Returns ClaveUnica redirect URL' do
        expect(status).to eq(200)
        expect(json_response_body[:url]).to start_with('https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout')
      end
    end
  end

  context 'when authenticating via OAuth' do
    before do
      @user = create(:user)

      # Mock OmniAuth's authentication
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:facebook] = OmniAuth::AuthHash.new({
        'provider' => 'facebook',
        'uid' => '12345',
        'info' => {
          'email' => @user.email,
          'name' => @user.first_name
        },
        'extra' => {
          'raw_info' => {
            'locale' => 'en_US',
            'id' => '12345'
          }
        }
      })

      # Mock identity to return our test user
      identity_double = instance_double(Identity, user: @user)
      allow(Identity).to receive(:find_or_build_with_omniauth).and_return(identity_double)

      mock_app_configuration
      facebook_method = mock_facebook_auth_method(@user)
      auth_service_mock = mock_authentication_service(facebook_method, @user)
      mock_omniauth_callback_controller(auth_service_mock)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/facebook/callback' do
      example 'Sets secure cookie with expected headers' do
        do_request

        expect(status).to eq(204)

        cookie_header = response_headers['Set-Cookie']
        expect(cookie_header).to include('cl2_jwt=test-jwt-token')
        expect(cookie_header).to include('SameSite=Lax')
        expect(cookie_header.include?('Secure')).to eq(false) # No HTTPS in the test environment
        expect(cookie_header).to match(/expires=.+GMT/i)
      end
    end
  end
end
