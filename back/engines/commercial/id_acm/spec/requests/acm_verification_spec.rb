# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'ACM verification (Oostende Itsme)' do
  let(:auth_hash) do
    { 'provider' => 'acm',
      'uid' => '8ebaf29ebc3f51800cf76c0cbb31e73ae9316ab9',
      'info' =>
       {
         'name' => nil,
         'email' => nil,
         'email_verified' => nil,
         'nickname' => nil,
         'first_name' => 'Ned',
         'last_name' => 'Flanders',
         'gender' => nil,
         'image' => nil,
         'phone' => nil,
         'urls' => { 'website' => nil }
       },
      'credentials' =>
       {
         'id_token' => 'eyJhbGciOiJSUzI1NiIsImtpZCI6InFrdElHd0lLU3IxajZidksxR2dRSFlCS2s4UmE1YnZZVFZpNUN4eWpsODQiLCJ0eXAiOiJKV1QifQ.eyJhdF9oYXNoIjoiVUJWeGpZNEdjMjY1d29EdTlzME02ZyIsImF1ZCI6IjIyOGU4YmJhLWIwYzctNDU3OC05MGIxLWU3MmU5YzdkYTRhZCIsImF6cCI6IjIyOGU4YmJhLWIwYzctNDU3OC05MGIxLWU3MmU5YzdkYTRhZCIsImV4cCI6MTc2NDE1ODAxNiwiZmFtaWx5X25hbWUiOiJIb29yZW5zIiwiZ2l2ZW5fbmFtZSI6IlPDqWJhc3RpZW4iLCJpYXQiOjE3NjQxNTQ0MTYsImlzcyI6Imh0dHBzOi8vYXV0aGVudGljYXRpZS10aS52bGFhbmRlcmVuLmJlL29wIiwia2lkIjoicWt0SUd3SUtTcjFqNmJ2SzFHZ1FIWUJLazhSYTVidllUVmk1Q3h5amw4NCIsIm5vbmNlIjoiY2JlZmUzYWVlNDU2MjQzOGI2ODI1OWEyMDMxYzJmZWMiLCJycm4iOiI5MjEwMTEyMTc5NyIsInN1YiI6IjhlYmFmMjllYmMzZjUxODAwY2Y3NmMwY2JiMzFlNzNhZTkzMTZhYjkifQ.DjDWmvMuL31mk96WR-_wXENx8VvV1bkajc0i9-2YC4UdrLF3JQZ6GcAjNq6LRkVSmOoHjlL5Ov-NehdG2-hV4F9RY76hu71aN4MQJLg5KV_xmr4Hbwe30oYagNX0NMaOUhJLdQbzfDOUbcDTJax_ZyRU0nWCO7SNdXUjfmWZeYobtoxd7ivcLiQfiwnCbcUefny6WEh2us4KDNXZ4Pf2WylSZsM16ETM3QJeQY3kflbed40WvKrp4pVP0FKKHAUS4kEIsyjZzWxNE2sDfeJo3ByjfvEozlm0LvadAiQQR9FGJIjZY2IL2M1rp0a07opGkITPeyGnku8bUpWqURIeCQ',
         'token' => 'q1ISdllPPxu8TSONdeXEapL1vDgn9j1ZiSDBn1xOu7k',
         'refresh_token' => nil,
         'expires_in' => 3599,
         'scope' => 'profile rrn'
       },
      'extra' =>
       {
         'raw_info' =>
          {
            'family_name' => 'Ned',
            'given_name' => 'Flanders',
            'rrn' => '86110121798',
            'sub' => '8ebaf29ebc3f51800cf76c0cbb31e73ae9316ab9',
            'at_hash' => 'UBVxjY4Gc265woDu9s0M6g',
            'aud' => '228e8bba-b0c7-4578-90b1-e72e9c7da4ad',
            'azp' => '228e8bba-b0c7-4578-90b1-e72e9c7da4ad',
            'exp' => 1_764_158_016,
            'iat' => 1_764_154_416,
            'iss' => 'https://authenticatie-ti.vlaanderen.be/op',
            'kid' => 'qktIGwIKSr1j6bvK1GgQHYBKk8Ra5bvYTVi5Cxyjl84',
            'nonce' => 'cbefe3aee4562438b68259a2031c2fec'
          }
       } }
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:acm] = OmniAuth::AuthHash.new(auth_hash)

    # Create a field for storing the RRN verification result
    result_field = create(:custom_field, key: 'rrn_verification_result', input_type: 'select', title_multiloc: { 'en' => 'RRN Verification Result' })
    result_field.options << create(:custom_field_option,  key: 'valid')
    result_field.options << create(:custom_field_option,  key: 'lives_outside')
    result_field.options << create(:custom_field_option,  key: 'under_minimum_age')
    result_field.options << create(:custom_field_option,  key: 'no_match')
    result_field.options << create(:custom_field_option,  key: 'service_error')

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'acm',
        domain: 'some.test.domain.com',
        client_id: '12345',
        client_secret: '78910',
        api_key: 'test',
        environment: 'production',
        rrn_environment: 'dv',
        rrn_api_key: 'dummy_key',
        rrn_result_custom_field_key: result_field.key
      }]
    }
    configuration.save!
    host! 'example.org'

    # Stub oostende verification API success
    stub_wijk_budget_api({ geldig: true })
  end

  def expect_user_to_be_verified(user)
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Ned',
      last_name: 'Flanders'
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'acm',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'acm')
    })
  end

  def expect_user_to_be_identified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'acm',
      user_id: user.id,
      uid: auth_hash['uid']
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  def expect_user_rnn_result(user, expected_result)
    result = user.custom_field_values['rrn_verification_result']
    expect(result).to eq expected_result
  end

  def expect_user_not_to_be_verified(user)
    expect(user.verified).to be false
    expect(user.verifications.count).to eq 0
  end

  def stub_wijk_budget_api(response, status: 200)
    stub_request(:get, %r{/WijkBudget/verificatie/.*})
      .to_return(
        status: status,
        body: { verificatieResultaat: response }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )
  end

  def disable_rrn_verification
    configuration = AppConfiguration.instance
    configuration.settings['verification']['verification_methods'].first['rrn_api_key'] = ''
    configuration.save!
  end

  context 'existing logged in users' do
    let!(:existing_user) { create(:user, first_name: 'EXISTING', last_name: 'USER', email: 'test@govocal.com') }
    let!(:token) { AuthToken::AuthToken.new(payload: existing_user.to_token_payload).token }

    it 'verifies an existing user' do
      get "/auth/acm?token=#{token}&verification_pathname=/some-page"
      follow_redirect!

      expect(response).to redirect_to('/en/some-page?verification_success=true')
      expect(existing_user.email).to eq('test@govocal.com')
      expect_user_to_be_verified(existing_user.reload)
      expect_user_rnn_result(existing_user.reload, 'valid')
    end

    context 'user is outside the area' do
      before { stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR11' }) }

      it 'verifies an existing user if outside the area, but sets RRN result to "lives_outside"' do
        get "/auth/acm?token=#{token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(existing_user.reload)
        expect_user_rnn_result(existing_user.reload, 'lives_outside')
      end

      it 'verifies a user outside the area, but does not set RRN result if rrn verification is not enabled' do
        disable_rrn_verification

        get "/auth/acm?token=#{token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(existing_user.reload)
        expect_user_rnn_result(existing_user.reload, nil)
      end
    end

    context 'user is too young' do
      before { stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR12' }) }

      it 'verfies an existing user if they are too young, but sets RRN result to "under_minimum_age"' do
        get "/auth/acm?token=#{token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(existing_user.reload)
        expect_user_rnn_result(existing_user.reload, 'under_minimum_age')
      end
    end
  end

  context 'existing user login' do
    let!(:existing_user) do
      user = create(:user, first_name: 'EXISTING', last_name: 'USER', email: 'test@govocal.com', verified: true, custom_field_values: { 'rrn_verification_result' => 'valid' })
      user.identities << create(:identity, provider: 'acm', user_id: user.id, uid: auth_hash['uid'])
      user.verifications << create(:verification, method_name: 'acm', hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'acm'))
      user
    end

    it 'logs in and verifies an existing user' do
      get '/auth/acm?sso_pathname=/some-page'
      follow_redirect!

      expect(cookies[:cl2_jwt]).to be_present
      expect(response).to redirect_to('/en/some-page?sso_flow=signin&sso_success=true')
      expect(existing_user.reload.email).to eq('test@govocal.com')
      expect_user_to_be_identified(existing_user.reload)
      expect_user_to_be_verified(existing_user.reload)
      expect_user_rnn_result(existing_user.reload, 'valid')
      expect(existing_user.reload.verifications.count).to eq 2 # Adds a new verification record
    end

    it 'logs in an existing user but changes their RRN result if the users verification status has changed' do
      stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR11' })

      get '/auth/acm?sso_pathname=/some-page'
      follow_redirect!

      expect(cookies[:cl2_jwt]).to be_present
      expect(response).to redirect_to('/en/some-page?sso_flow=signin&sso_success=true')
      expect(existing_user.reload.email).to eq('test@govocal.com')
      expect_user_to_be_identified(existing_user.reload)
      expect_user_to_be_verified(existing_user.reload)
      expect_user_rnn_result(existing_user.reload, 'lives_outside')
      expect(existing_user.reload.verifications.count).to eq 2 # Adds a new verification record
    end
  end

  context 'new user signup' do
    it 'creates a new verified user' do
      get '/auth/acm'
      follow_redirect!

      expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
      new_user = User.order(created_at: :asc).last
      expect_user_to_be_identified(new_user)
      expect_user_to_be_verified(new_user)
      expect_user_rnn_result(new_user, 'valid')
    end

    context 'user is outside the area' do
      before { stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR11' }) }

      it 'Creates a new user with RRN result of "lives_outside" if they are outside the area' do
        get '/auth/acm'
        follow_redirect!

        expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
        new_user = User.order(created_at: :asc).last
        expect_user_to_be_identified(new_user)
        expect_user_to_be_verified(new_user)
        expect_user_rnn_result(new_user, 'lives_outside')
      end

      it 'creates and verifies a user outside the area, if rrn verification is not enabled' do
        disable_rrn_verification
        get '/auth/acm'
        follow_redirect!

        expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
        new_user = User.order(created_at: :asc).last
        expect_user_to_be_identified(new_user)
        expect_user_to_be_verified(new_user)
        expect_user_rnn_result(new_user, nil)
      end
    end

    context 'verification service errors' do
      before { stub_wijk_budget_api({}) } # Empty response to simulate service error

      it 'creates and verifies a user with an RRN result of "no_match" if the RRN API is malformed' do
        stub_wijk_budget_api({})
        get '/auth/acm'
        follow_redirect!

        expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
        new_user = User.order(created_at: :asc).last
        expect_user_to_be_identified(new_user)
        expect_user_to_be_verified(new_user)
        expect_user_rnn_result(new_user, 'no_match')
      end

      it 'creates and verifies a user with an RRN result of "no_match" if it cannot find the RRN in the API' do
        stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR10' })
        get '/auth/acm'
        follow_redirect!

        expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
        new_user = User.order(created_at: :asc).last
        expect_user_to_be_identified(new_user)
        expect_user_to_be_verified(new_user)
        expect_user_rnn_result(new_user, 'no_match')
      end

      it 'creates and verifies a user with an RRN result of "service_error" if there is an error with the API request' do
        stub_wijk_budget_api(nil, status: 500)
        get '/auth/acm'
        follow_redirect!

        expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
        new_user = User.order(created_at: :asc).last
        expect_user_to_be_identified(new_user)
        expect_user_to_be_verified(new_user)
        expect_user_rnn_result(new_user, 'service_error')
      end
    end
  end
end
