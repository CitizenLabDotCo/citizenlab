# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def mock_app_configuration
  app_config_mock = instance_double(AppConfiguration)
  allow(app_config_mock).to receive(:closest_locale_to).and_return('en')
  allow(app_config_mock).to receive(:feature_activated?).with('facebook_login').and_return(true)
  allow(app_config_mock).to receive(:feature_activated?).with('user_confirmation').and_return(false)
  allow(app_config_mock).to receive(:settings).with('facebook_login', 'app_id').and_return('mock_facebook_app_id')
  allow(app_config_mock).to receive(:settings).with('facebook_login', 'app_secret').and_return('mock_facebook_app_secret')
  allow(AppConfiguration).to receive(:instance).and_return(app_config_mock)

  app_config_mock
end

def mock_facebook_auth_method(user)
  facebook_method = instance_double(OmniauthMethods::Facebook)
  allow(facebook_method).to receive_messages(
    profile_to_user_attrs: { email: user.email, first_name: user.first_name },
    email_confirmed?: true,
    verification_prioritized?: false,
    updateable_user_attrs: [],
    can_merge?: true
  )

  facebook_method
end

def mock_authentication_service(facebook_method, user)
  auth_service_mock = instance_double(AuthenticationService)
  allow(auth_service_mock).to receive(:method_by_provider).with('facebook').and_return(facebook_method)
  allow(auth_service_mock).to receive(:prevent_user_account_hijacking).and_return(user)

  auth_service_mock
end

def mock_omniauth_callback_controller(auth_service_mock)
  # Mock auth token
  auth_token_double = instance_double(AuthToken::AuthToken, token: 'test-jwt-token')
  allow_any_instance_of(OmniauthCallbackController).to receive(:auth_token).and_return(auth_token_double)

  # Make sure set_auth_cookie is actually called
  allow_any_instance_of(OmniauthCallbackController).to receive(:set_auth_cookie).and_call_original

  # Mock other methods
  allow_any_instance_of(OmniauthCallbackController).to receive(:authentication_service).and_return(auth_service_mock)
  allow_any_instance_of(OmniauthCallbackController).to receive(:update_user!).and_return(true)
  allow_any_instance_of(OmniauthCallbackController).to receive(:verified_for_sso?).and_return(true)
  allow_any_instance_of(OmniauthCallbackController).to receive(:signin_success_redirect)
end

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
        expect(cookie_header.include?('Secure')).to be(false) # No HTTPS in the test environment
        expect(cookie_header).to match(/expires=.+GMT/i)
      end
    end
  end
end
