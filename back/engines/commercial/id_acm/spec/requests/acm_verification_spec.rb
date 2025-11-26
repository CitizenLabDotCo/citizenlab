# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'ACM verification (Oostende Itsme)' do
  # {"provider" => "acm",
  #  "uid" => "8ebaf29ebc3f51800cf76c0cbb31e73ae9316ab9",
  #  "info" =>
  #    {"name" => nil, "email" => nil, "email_verified" => nil, "nickname" => nil, "first_name" => "Jaap", "last_name" => "Smit", "gender" => nil, "image" => nil, "phone" => nil, "urls" => {"website" => nil}},
  #  "credentials" =>
  #    {"id_token" =>
  #       "eyJhbGciOiJSUzI1NiIsImtpZCI6InFrdElHd0lLU3IxajZidksxR2dRSFlCS2s4UmE1YnZZVFZpNUN4eWpsODQiLCJ0eXAiOiJKV1QifQ.eyJhdF9oYXNoIjoiVUJWeGpZNEdjMjY1d29EdTlzME02ZyIsImF1ZCI6IjIyOGU4YmJhLWIwYzctNDU3OC05MGIxLWU3MmU5YzdkYTRhZCIsImF6cCI6IjIyOGU4YmJhLWIwYzctNDU3OC05MGIxLWU3MmU5YzdkYTRhZCIsImV4cCI6MTc2NDE1ODAxNiwiZmFtaWx5X25hbWUiOiJIb29yZW5zIiwiZ2l2ZW5fbmFtZSI6IlPDqWJhc3RpZW4iLCJpYXQiOjE3NjQxNTQ0MTYsImlzcyI6Imh0dHBzOi8vYXV0aGVudGljYXRpZS10aS52bGFhbmRlcmVuLmJlL29wIiwia2lkIjoicWt0SUd3SUtTcjFqNmJ2SzFHZ1FIWUJLazhSYTVidllUVmk1Q3h5amw4NCIsIm5vbmNlIjoiY2JlZmUzYWVlNDU2MjQzOGI2ODI1OWEyMDMxYzJmZWMiLCJycm4iOiI5MjEwMTEyMTc5NyIsInN1YiI6IjhlYmFmMjllYmMzZjUxODAwY2Y3NmMwY2JiMzFlNzNhZTkzMTZhYjkifQ.DjDWmvMuL31mk96WR-_wXENx8VvV1bkajc0i9-2YC4UdrLF3JQZ6GcAjNq6LRkVSmOoHjlL5Ov-NehdG2-hV4F9RY76hu71aN4MQJLg5KV_xmr4Hbwe30oYagNX0NMaOUhJLdQbzfDOUbcDTJax_ZyRU0nWCO7SNdXUjfmWZeYobtoxd7ivcLiQfiwnCbcUefny6WEh2us4KDNXZ4Pf2WylSZsM16ETM3QJeQY3kflbed40WvKrp4pVP0FKKHAUS4kEIsyjZzWxNE2sDfeJo3ByjfvEozlm0LvadAiQQR9FGJIjZY2IL2M1rp0a07opGkITPeyGnku8bUpWqURIeCQ",
  #     "token" => "q1ISdllPPxu8TSONdeXEapL1vDgn9j1ZiSDBn1xOu7k",
  #     "refresh_token" => nil,
  #     "expires_in" => 3599,
  #     "scope" => "profile rrn"},
  #  "extra" =>
  #    {"raw_info" =>
  #       {"family_name" => "Smit",
  #        "given_name" => "Jaap",
  #        "rrn" => "86110121798",
  #        "sub" => "8ebaf29ebc3f51800cf76c0cbb31e73ae9316ab9",
  #        "at_hash" => "UBVxjY4Gc265woDu9s0M6g",
  #        "aud" => "228e8bba-b0c7-4578-90b1-e72e9c7da4ad",
  #        "azp" => "228e8bba-b0c7-4578-90b1-e72e9c7da4ad",
  #        "exp" => 1764158016,
  #        "iat" => 1764154416,
  #        "iss" => "https://authenticatie-ti.vlaanderen.be/op",
  #        "kid" => "qktIGwIKSr1j6bvK1GgQHYBKk8Ra5bvYTVi5Cxyjl84",
  #        "nonce" => "cbefe3aee4562438b68259a2031c2fec"}}}

  let(:auth_hash) do
    {
      'provider' => 'acm',
      'uid' => 'f531d7e453bd58c1c47a9cea135d1626342ae142e44ebb17424a38142e4d1f66',
      'info' => {
        'name' => 'Nils Eriksson',
        'email' => 'test@govocal.com',
        'email_verified' => true,
        'nickname' => nil,
        'first_name' => 'Nils',
        'last_name' => 'Eriksson',
        'gender' => nil,
        'image' => nil,
        'phone' => nil,
        'urls' => { 'website' => nil }
      },
      'credentials' => {
        'id_token' => 'eyJhbGciOiJSUzI1NiIsImtpZCI6IktITjN5V0xhNjduRnlQSkJOQzJsS2w3N1lTdyJ9.eyJpc3MiOiJodHRwczovL3RpY2tldC10ZXN0MS5zaXJpdXNpdC5uZXQiLCJhenAiOiJoZWxzaW5nYm9yZ19nb3ZvY2FsIiwiYXVkIjoiaGVsc2luZ2JvcmdfZ292b2NhbCIsInN1YiI6ImY1MzFkN2U0NTNiZDU4YzFjNDdhOWNlYTEzNWQxNjI2MzQyYWUxNDJlNDRlYmIxNzQyNGEzODE0MmU0ZDFmNjYiLCJub25jZSI6IjEyMWEyOTY2NmM4OTQ2YzBlZmRjMzVkN2Y4ZDU4YjdjIiwibmFtZSI6IlRlZCBUZXN0IiwiZ2l2ZW5fbmFtZSI6IlRlZCIsImZhbWlseV9uYW1lIjoiVGVzdCIsImh0dHBzOi8vaWQub2lkYy5zZS9jbGFpbS9wZXJzb25hbElkZW50aXR5TnVtYmVyIjoiMjAxMjAxMDEzODQyIiwiaHR0cHM6Ly9pZC5vaWRjLnNlL2NsYWltL2F1dGhuUHJvdmlkZXIiOiJCYW5rSUQgTW9iaWxlIiwiYXV0aF90aW1lIjoxNzQ1NDAzNjc1LCJpYXQiOjE3NDU0MDM2NzUsImV4cCI6MTc0NTQwMzk3NX0.z4iFVOkTtxGOUXRGflXnSwqlR6gnBlstEv7jZSk_BZom9Qj1W7UPoHBU9I3OJzR9HjZjrIpgwVkI1_dSeuBe3cwtqpULT6xbH0ozCZZKwUsjQOzCP620MJnMBPYkVodZXg7sZGSgqQmECLNdiE0wg7JN-hcIp7KVpsBHR1NWYPI-0ksfli8H8vxpfL71UGJD7dT7M5CJoTEilxH80nSqUm5lDIaqzGWqVCP0bDQ1U_wmmkiv6i-uFSfVRvzwCzyhu9sAA-TYnxA0hQPj9NOp-oMY9c-Ig8AUtMpKOcQ57nyxuRGJx62btvAp7MPUXaAkHDyGZKRLr6p1Dj2BM6gYww',
        'token' => '24f979c56980412bb8fe6b025435032f',
        'refresh_token' => nil,
        'expires_in' => 300,
        'scope' => 'openid'
      },
      'extra' => {
        'raw_info' => {
          'error' => 'Session has expired',
          'iss' => 'https://ticket-test1.siriusit.net',
          'azp' => 'helsingborg_govocal',
          'aud' => 'helsingborg_govocal',
          'sub' => 'f531d7e453bd58c1c47a9cea135d1626342ae142e44ebb17424a38142e4d1f66',
          'nonce' => '121a29666c8946c0efdc35d7f8d58b7c',
          'name' => 'Nils Eriksson',
          'given_name' => 'Nils',
          'family_name' => 'Eriksson',
          'https://id.oidc.se/claim/personalIdentityNumber' => '201201013842',
          'https://id.oidc.se/claim/authnProvider' => 'BankID Mobile',
          'auth_time' => 1_745_403_675,
          'iat' => 1_745_403_675,
          'exp' => 1_745_403_975
        }
      }
    }
  end

  before do
    @user = create(:user, first_name: 'EXISTING', last_name: 'USER')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:acm] = OmniAuth::AuthHash.new(auth_hash)

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
        rrn_verification: 'Oostende',
        rrn_environment: 'dv',
        rrn_api_key: 'dummy_key'
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
      first_name: 'Nils',
      last_name: 'Eriksson',
      email: 'test@govocal.com',
      custom_field_values: {}
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

  def stub_wijk_budget_api(response)
    stub_request(:get, %r{/WijkBudget/verificatie/.*})
      .to_return(
        status: 200,
        body: { verificatieResultaat: response }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )
  end

  context 'existing users' do
    before { @user.update!(email: 'test@govocal.com') }

    it 'verifies an existing user' do
      get "/auth/acm?token=#{@token}&verification_pathname=/some-page"
      follow_redirect!

      expect(response).to redirect_to('/en/some-page?verification_success=true')
      expect_user_to_be_verified(@user.reload)
    end

    context 'user is outside the area' do
      before { stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR11' }) }

      it 'does not verify an existing user if outside the area' do
        get "/auth/acm?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/some-page?verification_error=true&error_code=not_entitled_lives_outside')
        expect(@user.reload).to have_attributes({ verified: false })
        expect(@user.reload.verifications.count).to eq 0
      end

      it 'verifies a user outside the area, if rrn verification is set to "None"' do
        configuration = AppConfiguration.instance
        configuration.settings['verification']['verification_methods'].first['rrn_verification'] = 'None'
        configuration.save!

        get "/auth/acm?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(@user.reload)
      end
    end

    context 'user is too young' do
      before { stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR12' }) }

      it 'does not verify an existing user if they are too young' do
        get "/auth/acm?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/some-page?verification_error=true&error_code=not_entitled_too_young')
        expect(@user.reload).to have_attributes({ verified: false })
        expect(@user.reload.verifications.count).to eq 0
      end
    end
  end

  context 'new users' do
    it 'creates a new verified user' do
      get '/auth/acm'
      follow_redirect!

      user = User.order(created_at: :asc).last
      expect_user_to_be_identified(user)
      expect_user_to_be_verified(user)
    end

    it 'creates a new user, but does not verify if outside the area' do
      stub_wijk_budget_api({ geldig: false, redenNietGeldig: 'ERR11' })

      get '/auth/acm'
      follow_redirect!

      user = User.order(created_at: :asc).last
      expect_user_to_be_identified(user)
      expect(user.verified).to be false
      expect(user.verifications.count).to eq 0
    end
  end
end
