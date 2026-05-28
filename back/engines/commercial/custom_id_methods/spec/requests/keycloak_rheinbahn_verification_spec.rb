# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'keycloak verification (Rheinbahn)' do
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
        provider: 'rheinbahn',
        issuer: 'https://some.test.domain.com/auth/realms/example-realm',
        client_id: '12345',
        client_secret: '78910'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_not_be_verified(user)
    expect(user.reload).to have_attributes({
      verified: false,
      first_name: 'Unøy-Aktig',
      last_name: 'Kost Nost',
      custom_field_values: {}
    })
    expect(user.verifications.count).to eq 0
  end

  def expect_user_to_be_identified_not_verified(user)
    expect_user_to_not_be_verified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'keycloak',
      user_id: user.id,
      uid: auth_hash['uid']
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  it 'does not verify or add an identity an existing logged in user' do
    get "/auth/keycloak?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect_user_to_not_be_verified(@user)
    expect(@user.identities.count).to eq(0)
  end

  it 'creates a new user when the authentication token is not passed' do
    expect(User.count).to eq(1)
    get '/auth/keycloak?param=some-param'
    follow_redirect!

    expect(User.count).to eq(2)

    user = User.order(created_at: :asc).last
    expect_user_to_be_identified_not_verified(user)

    expect(user).not_to eq(@user)
    expect(user).to have_attributes({
      email: 'test@govocal.com',
      password_digest: nil
    })

    expect(response).to redirect_to('/en/?param=some-param&sso_flow=signup&sso_success=true')
  end

  context 'when identity is already taken by a user' do
    before do
      # Login and create the new user first
      get '/auth/keycloak'
      follow_redirect!
    end

    let!(:sso_user) do
      User.order(created_at: :asc).last.tap do |user|
        expect(user).to have_attributes({ email: 'test@govocal.com' })
        expect_user_to_be_identified_not_verified(user)
      end
    end

    it 'logs the user in as the existing sso user' do
      get '/auth/keycloak?param=some-param'
      follow_redirect!

      expect(response).to redirect_to('/en/?param=some-param&sso_flow=signin&sso_success=true')
      expect(cookies[:cl2_jwt]).to be_present
      jwt_payload = JWT.decode(cookies[:cl2_jwt], nil, false).first
      expect(sso_user.reload).to eq(sso_user)
      expect(jwt_payload['sub']).to eq(sso_user.id)
    end
  end
end
