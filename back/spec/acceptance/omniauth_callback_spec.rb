# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def get_auth_hash(email_confirmed: true)
  OmniAuth::AuthHash.new({
    provider: 'fake_sso',
    uid: 'billy_fixed',
    info: {
      name: 'Billy Fixed',
      email: 'billy_fixed@example.com',
      email_verified: email_confirmed,
      nickname: nil,
      first_name: 'Billy',
      last_name: 'Fixed',
      gender: 'male',
      image: nil,
      phone: nil,
      urls: {
        website: nil
      }
    },
    credentials: {
      id_token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJlODI0ZWQ1Ny0xN2RkLTQ3NDEtYTUxOS0wNjY0MGVmMzdmMjkiLCJzdWIiOiJiaWxseV9maXhlZCIsImF6cCI6Imdvdm9jYWxfY2xpZW50IiwiZW1haWwiOiJiaWxseV9maXhlZEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkJpbGx5IEZpeGVkIiwiZ2l2ZW5fbmFtZSI6IkJpbGx5IiwiZmFtaWx5X25hbWUiOiJGaXhlZCIsImdlbmRlciI6Im1hbGUiLCJiaXJ0aGRhdGUiOiIxOTgwLTAxLTAxIiwiaWF0IjoxNzU5MjQ4MTM0LCJpc3MiOiJodHRwOi8vaG9zdC5kb2NrZXIuaW50ZXJuYWwiLCJhdWQiOiJnb3ZvY2FsX2NsaWVudCIsImV4cCI6MTc1OTI1NTMzNH0.IrccEvOLjg-r0itQZ9whoWdKkthtKNnvy-P0X67hjgg',
      token: 'access_token_abc123',
      refresh_token: nil,
      expires_in: nil,
      scope: nil
    },
    extra: {
      raw_info: {
        some: 'stuff',
        uid: 'e824ed57-17dd-4741-a519-06640ef37f29',
        sub: 'billy_fixed',
        azp: 'govocal_client',
        email: 'billy_fixed@example.com',
        email_verified: email_confirmed,
        name: 'Billy Fixed',
        given_name: 'Billy',
        family_name: 'Fixed',
        gender: 'male',
        birthdate: '1980-01-01',
        iat: 1_759_248_134,
        iss: 'http://host.docker.internal',
        aud: 'govocal_client',
        exp: 1_759_255_334
      }
    }
  })
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
      allow_any_instance_of(OmniauthCallbackController).to receive(:update_identity!).and_return(true)
      allow_any_instance_of(OmniauthCallbackController).to receive(:verified_for_sso?).and_return(true)
      allow_any_instance_of(OmniauthCallbackController).to receive(:signin_success_redirect)
    end

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

  context 'when SSO method returns email and it is confirmed' do
    before do
      AppConfiguration.instance.settings['verification'] = {
        'allowed' => true,
        'enabled' => true,
        verification_methods: [{ name: 'fake_sso' }]
      }
      AppConfiguration.instance.save!
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:fake_sso] = get_auth_hash(email_confirmed: true)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/fake_sso/callback' do
      example 'a new user is created and email is confirmed' do
        do_request

        expect(status).to eq(302) # Redirect code
        user = User.find_by(email: 'billy_fixed@example.com')
        expect(user).not_to be_nil
        expect(user.email_confirmed_at).to be_present
        expect(user.verified).to be true
      end

      example 'if there is a pending invite with this email: allow create account' do
        create(:invited_user, email: 'billy_fixed@example.com')

        do_request

        expect(status).to eq(302) # Redirect code
        db_user = User.find_by(email: 'billy_fixed@example.com')
        expect(db_user).not_to be_nil
        expect(db_user.email_confirmed_at).to be_present
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }

        before do
          allow_any_instance_of(OmniauthCallbackController)
            .to receive(:omniauth_params)
            .and_return({ 'claim_tokens' => [claim_token.token] })
        end

        example 'claims participation data immediately for new user' do
          expect(idea.author_id).to be_nil

          do_request
          expect(status).to eq(302)

          user = User.find_by(email: 'billy_fixed@example.com')
          expect(user).not_to be_nil
          expect(idea.reload.author_id).to eq(user.id)
          expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        context 'when existing user logs in' do
          let!(:existing_user) { create(:user, email: 'billy_fixed@example.com') }

          example 'claims participation data immediately' do
            expect(idea.author_id).to be_nil

            do_request
            expect(status).to eq(302)

            expect(idea.reload.author_id).to eq(existing_user.id)
            expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end

        context 'when invited user accepts via SSO' do
          let!(:invited_user) { create(:invited_user, email: 'billy_fixed@example.com') }

          example 'claims participation data immediately after invite acceptance' do
            expect(idea.author_id).to be_nil

            do_request
            expect(status).to eq(302)

            expect(idea.reload.author_id).to eq(invited_user.id)
            expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end
    end
  end

  context 'when SSO method returns email but it is not confirmed' do
    before do
      AppConfiguration.instance.settings['verification'] = {
        'allowed' => true,
        'enabled' => true,
        verification_methods: [{ name: 'fake_sso' }]
      }
      AppConfiguration.instance.save!
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:fake_sso] = get_auth_hash(email_confirmed: false)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/fake_sso/callback' do
      example 'a new user is created but email is not confirmed' do
        do_request

        expect(status).to eq(302) # Redirect code
        user = User.find_by(email: 'billy_fixed@example.com')
        expect(user).not_to be_nil
        expect(user.email_confirmed_at).to be_nil
        expect(user.verified).to be true
      end

      example 'if there is a pending invite with this email: return error' do
        user = create(:invited_user, email: 'billy_fixed@example.com')
        do_request
        expect(status).to eq(302) # Redirect code
        expect(response_headers['Location']).to include('authentication_error=true')
        expect(user.reload.invite_status).to eq('pending')
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }

        before do
          SettingsService.new.activate_feature!('user_confirmation')
          allow_any_instance_of(OmniauthCallbackController).to receive(:omniauth_params).and_return({
            'claim_tokens' => [claim_token.token]
          })
        end

        example 'marks claim tokens as pending for new user (not claimed until email confirmed)' do
          expect(idea.author_id).to be_nil

          do_request
          expect(status).to eq(302)

          user = User.find_by(email: 'billy_fixed@example.com')
          expect(user).not_to be_nil
          expect(user.email_confirmed_at).to be_nil
          expect(claim_token.reload.pending_claimer_id).to eq(user.id)
          expect(idea.reload.author_id).to be_nil # Not yet claimed
        end
      end
    end
  end
end
