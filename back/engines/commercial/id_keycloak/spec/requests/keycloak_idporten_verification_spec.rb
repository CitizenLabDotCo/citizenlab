# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'keycloak verification (ID-Porten - Oslo)' do
  let(:auth_hash) do
    {
      'provider' => 'keycloak',
      'uid' => 'b045a9a9-cf7e-4add-acc7-1f606eb1e9e0',
      'info' => {
        'name' => 'UNØY-AKTIG KOST NOST',
        'email' => 'test@govocal.com',
        'email_verified' => false,
        'nickname' => '21929974805',
        'first_name' => 'UNØY-AKTIG',
        'last_name' => 'KOST NOST',
        'gender' => nil,
        'image' => nil,
        'phone' => '+447780122122',
        'urls' => { 'website' => nil }
      },
      'credentials' => {
        # rubocop:disable Layout/LineLength
        'id_token' =>
           'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMQW1ZSGI5ODZGWnAwX29pT2NaaTFzUUxVaU1TeFFsYkYtdl9OQmdHQ2J3In0.eyJleHAiOjE3MjgzMDcyNzAsImlhdCI6MTcyODMwNjk3MCwiYXV0aF90aW1lIjoxNzI4MzA1MjQ4LCJqdGkiOiI4NjQ2NDA5My05YzRiLTRlMTItOThjOC1iNTM0ZTg0MzZjMzUiLCJpc3MiOiJodHRwczovL2xvZ2luLXRlc3Qub3Nsby5rb21tdW5lLm5vL2F1dGgvcmVhbG1zL2lkcG9ydGVuIiwiYXVkIjoibWVkdmlya25pbmciLCJzdWIiOiJiMDQ1YTlhOS1jZjdlLTRhZGQtYWNjNy0xZjYwNmViMWU5ZTAiLCJ0eXAiOiJJRCIsImF6cCI6Im1lZHZpcmtuaW5nIiwibm9uY2UiOiIyODRmZjQ2NTcxYzIwMTVjZWQxNzY1NjQ0Mjc3ZDk0NCIsInNlc3Npb25fc3RhdGUiOiI0ZTEyMjQ4YS0yNGZlLTQ2Y2YtYWY5Mi0wNWNmYjNlNzllMzEiLCJhdF9oYXNoIjoibzVXV1NPNTBvS2xRMXdsLV9KdUZXUSIsImFjciI6IjAiLCJzaWQiOiI0ZTEyMjQ4YS0yNGZlLTQ2Y2YtYWY5Mi0wNWNmYjNlNzllMzEiLCJhZGRyZXNzIjp7fSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJhY3Jfc2VjdXJpdHlfbGV2ZWwiOiJpZHBvcnRlbi1sb2Etc3Vic3RhbnRpYWwiLCJhbXIiOiJUZXN0SUQiLCJuYW1lIjoiVU7DmFlBS1RJRyBLT1NUIiwicGlkIjoiMjE5Mjk5NzQ4MDUiLCJwaG9uZV9udW1iZXIiOiIrNDQ3Nzg3MTM1MzYxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiMjE5Mjk5NzQ4MDUiLCJnaXZlbl9uYW1lIjoiVU7DmFlBS1RJRyIsImxvY2FsZSI6ImVuIiwiZmFtaWx5X25hbWUiOiJLT1NUIiwiZW1haWwiOiJ0ZXN0QHNwZWFrZS5vcmcifQ.M2DclHfBvELc8mSD0Av-9WJ0k0Py4SAQb3TsaldPdwaGGo57Jb-L0-RJ18eaeGTPtThNXWCZ-1aVd_Wf97Dq_rZUGarlD5OWXVn6DVuNSkRkv_s-a7vKOHw7bxz-eQ-yQIdYE47u0FvBGFB5SdHGdtCVE7hqKT1CWVXHtPYC1r5DV80YlHijhyZPHicjrnq4qBDaXmQepa_CBPjYz-jhwyaYFnEHEpRS_SaP3TpXA4DV3pgapigftpxtiMzgEZ75aHRrjnq_sBtXdffCNZcKCjO9ZM3OXmO8PYqQSORNBXBJBoZ4XaBNZr75s4LVgF3tigjGSeoJncaNm93zmCPQ_Q',
        'token' =>
             'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMQW1ZSGI5ODZGWnAwX29pT2NaaTFzUUxVaU1TeFFsYkYtdl9OQmdHQ2J3In0.eyJleHAiOjE3MjgzMDcyNzAsImlhdCI6MTcyODMwNjk3MCwiYXV0aF90aW1lIjoxNzI4MzA1MjQ4LCJqdGkiOiJmYjY4Zjc2Yi1kYTU3LTQ1ZDItOWU0Ny0zNzIxNDIzNDBiNDQiLCJpc3MiOiJodHRwczovL2xvZ2luLXRlc3Qub3Nsby5rb21tdW5lLm5vL2F1dGgvcmVhbG1zL2lkcG9ydGVuIiwiYXVkIjpbImJyb2tlciIsImFjY291bnQiXSwic3ViIjoiYjA0NWE5YTktY2Y3ZS00YWRkLWFjYzctMWY2MDZlYjFlOWUwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWVkdmlya25pbmciLCJub25jZSI6IjI4NGZmNDY1NzFjMjAxNWNlZDE3NjU2NDQyNzdkOTQ0Iiwic2Vzc2lvbl9zdGF0ZSI6IjRlMTIyNDhhLTI0ZmUtNDZjZi1hZjkyLTA1Y2ZiM2U3OWUzMSIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9rZXljbG9hay5lcGljLmNpdGl6ZW5sYWIuY28iLCJodHRwczovL21lZHZpcmtuaW5nLm9zbG8ua29tbXVuZS5ubyIsImh0dHBzOi8va2V5Y2xvYWstcjN0eXUubG9jYS5sdCIsImh0dHBzOi8vZGVtby5zdGcuZ292b2NhbC5jb20iXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtaWRwb3J0ZW4iLCJvZmZsaW5lX2FjY2VzcyIsIkxldmVsMyIsInVzZXIiXX0sInJlc291cmNlX2FjY2VzcyI6eyJicm9rZXIiOnsicm9sZXMiOlsicmVhZC10b2tlbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIG9wZW5pZCBvc2xva29tbXVuZS1vcGVuaWRjb25uZWN0LW1pbmltYWwgYWRkcmVzcyIsInNpZCI6IjRlMTIyNDhhLTI0ZmUtNDZjZi1hZjkyLTA1Y2ZiM2U3OWUzMSIsImFkZHJlc3MiOnt9LCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJVTsOYWUFLVElHIEtPU1QiLCJsb2NhbGUiOiJlbiIsImdpdmVuX25hbWUiOiJVTsOYWUFLVElHIiwiZmFtaWx5X25hbWUiOiJLT1NUIiwiZW1haWwiOiJ0ZXN0QHNwZWFrZS5vcmcifQ.FHdrszn8_CnZ-AF8e2UsModph3AwjNv8QSzDHIuTHdroG6DJLRKPZYgywQZ7W9RYWtRvckikZvNepT0WxWp-OjPOIMH7zavy0XWfT7E15lD_0xx8dDBoyMr6JxyXRL4Pb7fSxqiW27W3cQjQSC_c_iHWCJhgLukDndBQu43Rq7l-uLWrIwJiLzSGdUG1jKynHhBcYIxQXnJapoWAPXfhC9RytZPBoZg9D_G5KXMnLIb2_Q4mu2Oqlkmk2YZxWVkwG9bMiX3stanY88_ieY2g9L1jJXq_V6GvjzpBpeKT1qLx40ES-ojQaNeVOxlv1dX5kBRDvm_iIlA7wCu660i5jw',
        'refresh_token' =>
             'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjNTUxN2U2Mi04NmU3LTQ2YjgtOWFhZi04NGM4YWYyNWU1ZDQifQ.eyJleHAiOjE3MjgzMDg3NzAsImlhdCI6MTcyODMwNjk3MCwianRpIjoiMTBkMGI5OGUtNzYzNi00ZmE3LWE2OWMtY2MxY2FhODlhZWQ0IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi10ZXN0Lm9zbG8ua29tbXVuZS5uby9hdXRoL3JlYWxtcy9pZHBvcnRlbiIsImF1ZCI6Imh0dHBzOi8vbG9naW4tdGVzdC5vc2xvLmtvbW11bmUubm8vYXV0aC9yZWFsbXMvaWRwb3J0ZW4iLCJzdWIiOiJiMDQ1YTlhOS1jZjdlLTRhZGQtYWNjNy0xZjYwNmViMWU5ZTAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoibWVkdmlya25pbmciLCJub25jZSI6IjI4NGZmNDY1NzFjMjAxNWNlZDE3NjU2NDQyNzdkOTQ0Iiwic2Vzc2lvbl9zdGF0ZSI6IjRlMTIyNDhhLTI0ZmUtNDZjZi1hZjkyLTA1Y2ZiM2U3OWUzMSIsInNjb3BlIjoicHJvZmlsZSBlbWFpbCBvcGVuaWQgb3Nsb2tvbW11bmUtb3BlbmlkY29ubmVjdC1taW5pbWFsIGFkZHJlc3MiLCJzaWQiOiI0ZTEyMjQ4YS0yNGZlLTQ2Y2YtYWY5Mi0wNWNmYjNlNzllMzEifQ.O017EugYMgsXZ9m3yn96UjFeu90qTD4pmtQ8OYCKmRY',
        'expires_in' => 300,
        'scope' => 'profile email openid oslokommune-openidconnect-minimal address'
        # rubocop:enable Layout/LineLength
      },
      'extra' => {
        'raw_info' => {
          'sub' => 'b045a9a9-cf7e-4add-acc7-1f606eb1e9e0',
          'address' => {},
          'email_verified' => false,
          'amr' => 'TestID',
          'pid' => '21929974805',
          'preferred_username' => '21929974805',
          'given_name' => 'UNØY-AKTIG',
          'locale' => 'en',
          'acr_security_level' => 'idporten-loa-substantial',
          'name' => 'UNØY-AKTIG KOST NOST',
          'phone_number' => '+447780122122',
          'family_name' => 'KOST NOST',
          'email' => 'test@govocal.com',
          'exp' => 1_728_307_270,
          'iat' => 1_728_306_970,
          'auth_time' => 1_728_305_248,
          'jti' => '86464093-9c4b-4e12-98c8-b534e8436c35',
          'iss' => 'https://login-test.oslo.kommune.no/auth/realms/idporten',
          'aud' => 'medvirkning',
          'typ' => 'ID',
          'azp' => 'medvirkning',
          'nonce' => '284ff46571c2015ced1765644277d944',
          'session_state' => '4e12248a-24fe-46cf-af92-05cfb3e79e31',
          'at_hash' => 'o5WWSO50oKlQ1wl-_JuFWQ',
          'acr' => '0',
          'sid' => '4e12248a-24fe-46cf-af92-05cfb3e79e31'
        }
      }
    }
  end

  before do
    @user = create(:user, first_name: 'EXISTING', last_name: 'USER')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:keycloak] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'keycloak',
        provider: 'idporten',
        issuer: 'https://some.test.domain.com/auth/realms/example-realm',
        client_id: '12345',
        client_secret: '78910'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_be_verified(user)
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Unøy-Aktig',
      last_name: 'Kost Nost',
      custom_field_values: {}
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'keycloak',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'keycloak')
    })
  end

  def expect_user_to_be_verified_and_identified(user)
    expect_user_to_be_verified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'keycloak',
      user_id: user.id,
      uid: auth_hash['uid']
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  context 'email provided in auth response' do
    it 'successfully verifies an existing user' do
      get "/auth/keycloak?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
      follow_redirect!

      expect_user_to_be_verified(@user)

      expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')
    end

    it 'successfully authenticates an existing user that was previously verified' do
      get "/auth/keycloak?token=#{@token}"
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(0)
      expect_user_to_be_verified(@user)

      get '/auth/keycloak'
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(1)
      expect_user_to_be_verified_and_identified(@user)
    end

    it 'successfully verifies another user with another ID-Porten account' do
      get "/auth/keycloak?token=#{@token}"
      follow_redirect!
      expect(@user.reload).to have_attributes({
        verified: true
      })

      user2 = create(:user)
      token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
      auth_hash['uid'] = 'f8f151a4-4a80-4106-919c-244084e1ce21'
      OmniAuth.config.mock_auth[:keycloak] = OmniAuth::AuthHash.new(auth_hash)

      get "/auth/keycloak?token=#{token2}"
      follow_redirect!
      expect(user2.reload).to have_attributes(verified: true)
    end

    it 'fails when uid has already been used' do
      create(
        :verification,
        method_name: 'keycloak',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'keycloak')
      )

      get "/auth/keycloak?token=#{@token}"
      follow_redirect!

      expect(@user.reload).to have_attributes(verified: false)
    end

    it 'creates a new user when the authentication token is not passed' do
      expect(User.count).to eq(1)
      get '/auth/keycloak?param=some-param'
      follow_redirect!

      expect(User.count).to eq(2)

      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)

      expect(user).not_to eq(@user)
      expect(user).to have_attributes({
        email: 'test@govocal.com',
        password_digest: nil
      })

      expect(response).to redirect_to('/en/?param=some-param&sso_flow=signup&sso_success=true')
    end
  end

  context 'email NOT provided in auth response' do
    before do
      configuration = AppConfiguration.instance
      configuration.settings['password_login'] = {
        'allowed' => true,
        'enabled' => true,
        'enable_signup' => true,
        'minimum_length' => 8
      }
      configuration.save!
      auth_hash['info']['email'] = nil
      OmniAuth.config.mock_auth[:keycloak] = OmniAuth::AuthHash.new(auth_hash)
    end

    context 'when verification is already taken by a new user with no email' do
      before do
        get '/auth/keycloak'
        follow_redirect!
      end

      let!(:new_user) do
        User.order(created_at: :asc).last.tap do |user|
          expect(user).to have_attributes({ email: nil })
          expect_user_to_be_verified_and_identified(user)
        end
      end

      context 'when verified registration is completed by new user' do
        before { new_user.update!(email: Faker::Internet.email) }

        it 'does not verify another user and does not delete previously verified new user' do
          get "/auth/keycloak?token=#{@token}&verification_pathname=/some-page"
          follow_redirect!

          expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
          expect(@user.reload).to have_attributes({
            verified: false,
            first_name: 'EXISTING',
            last_name: 'USER'
          })

          expect(new_user.reload).to eq(new_user)
        end
      end

      context 'when verified registration is not completed by new user' do
        it 'successfully verifies another user and deletes previously verified blank new user' do
          get "/auth/keycloak?token=#{@token}&verification_pathname=/some-page"
          follow_redirect!

          expect(response).to redirect_to('/en/some-page?verification_success=true')
          expect_user_to_be_verified(@user.reload)
          expect { new_user.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    context 'email confirmation enabled' do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          'enabled' => true,
          'allowed' => true
        }
        configuration.save!
      end

      it 'creates user that can add & confirm her email' do
        get '/auth/keycloak'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.active?).to be(true)
        expect(user.confirmation_required?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(0)

        headers = { 'Authorization' => authorization_header(user) }

        post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ new_email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(true)
        expect(user.active?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(1)

        post '/web_api/v1/user/confirm_code_email_change', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
        expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.new_email).to be_nil
      end

      it 'allows users to be active without adding an email & confirmation' do
        get '/auth/keycloak'
        follow_redirect!

        get '/auth/keycloak'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
      end

      it 'does not send email to empty email address (when just registered)' do
        get '/auth/keycloak'
        follow_redirect!

        expect(ActionMailer::Base.deliveries).to be_empty
      end
    end

    context 'email confirmation disabled' do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          'enabled' => false,
          'allowed' => false
        }
        configuration.save!

        create(:custom_field, key: 'birthdate')
        create(:custom_field, key: 'birthyear', input_type: 'number')
        create(:custom_field, key: 'municipality_code')
      end

      it 'creates user that can update her email' do
        get '/auth/keycloak'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)

        token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
        headers = { 'Authorization' => "Bearer #{token}" }
        patch '/web_api/v1/users/update_email_unconfirmed', params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end
end
