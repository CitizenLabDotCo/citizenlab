# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'etat_lu verification' do
  let(:auth_hash) do
    {
      'provider' => 'etat_lu',
      'uid' => 'ABC123',
      'info' => {
        'name' => 'Theo Musterman',
        'email' => 'Theo.Musterman@ctie.etat.lu',
        'email_verified' => nil,
        'nickname' => 'ABC123',
        'first_name' => 'Theo',
        'last_name' => 'Musterman',
        'gender' => nil,
        'image' => nil,
        'phone' => nil,
        'urls' => { 'website' => nil }
      },
      'credentials' => {
        'id_token' => 'eyJhbGciOiJSUzI1NiJ9.fake_id_token_payload.fake_signature',
        'token' => 'fake_access_token',
        'refresh_token' => nil,
        'expires_in' => 3600,
        'scope' => 'openid email profile'
      },
      'extra' => {
        'raw_info' => {
          'sub' => 'ABC123',
          'iss' => 'https://idp.intranet.etat.lu',
          'aud' => 'cifwt-test',
          'iat' => 1_654_704_881,
          'exp' => 1_654_708_481,
          'at_hash' => 'SPH1O_Jpiwz0r4hOqn8dcQ',
          'preferred_username' => 'ABC123',
          'name' => 'Theo Musterman',
          'given_name' => 'Theo',
          'family_name' => 'Musterman',
          'email' => 'Theo.Musterman@ctie.etat.lu',
          'groups' => %w[USER TESTER]
        }
      }
    }
  end

  before do
    @user = create(:user, first_name: 'EXISTING', last_name: 'USER')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:etat_lu] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'etat_lu',
        issuer: 'https://idp.etat.lu',
        client_id: 'cifwt-test',
        client_secret: 'test-secret'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_be_verified(user)
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Theo',
      last_name: 'Musterman'
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'etat_lu',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'etat_lu')
    })
  end

  def expect_user_to_be_verified_and_identified(user)
    expect_user_to_be_verified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'etat_lu',
      user_id: user.id,
      uid: auth_hash['uid']
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  context 'when verifying an existing user' do
    it 'successfully verifies an existing user' do
      get "/auth/etat_lu?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
      follow_redirect!

      expect_user_to_be_verified(@user)

      expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')
    end

    it 'successfully authenticates an existing user that was previously verified' do
      get "/auth/etat_lu?token=#{@token}"
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(0)
      expect_user_to_be_verified(@user)

      get '/auth/etat_lu'
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(1)
      expect_user_to_be_verified_and_identified(@user)
    end

    it 'successfully verifies another user with another etat_lu account' do
      get "/auth/etat_lu?token=#{@token}"
      follow_redirect!
      expect(@user.reload).to have_attributes(verified: true)

      user2 = create(:user)
      token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
      auth_hash['uid'] = 'XYZ789'
      auth_hash['extra']['raw_info']['sub'] = 'XYZ789'
      OmniAuth.config.mock_auth[:etat_lu] = OmniAuth::AuthHash.new(auth_hash)

      get "/auth/etat_lu?token=#{token2}"
      follow_redirect!
      expect(user2.reload).to have_attributes(verified: true)
    end

    it 'fails when uid has already been used' do
      create(
        :verification,
        method_name: 'etat_lu',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'etat_lu')
      )

      get "/auth/etat_lu?token=#{@token}"
      follow_redirect!

      expect(@user.reload).to have_attributes(verified: false)
    end
  end

  context 'when no auth token is passed (sign up / sign in flow)' do
    it 'creates a new user verified and identified' do
      expect(User.count).to eq(1)
      get '/auth/etat_lu?param=some-param'
      follow_redirect!

      expect(User.count).to eq(2)

      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)

      expect(user).not_to eq(@user)
      expect(user).to have_attributes({
        email: 'Theo.Musterman@ctie.etat.lu',
        password_digest: nil
      })

      expect(response).to redirect_to('/fr-FR/?param=some-param&sso_flow=signup&sso_success=true')
    end

    it 'signs in an existing identified user without requiring email confirmation' do
      get '/auth/etat_lu'
      follow_redirect!
      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)

      get '/auth/etat_lu'
      follow_redirect!

      expect(User.count).to eq(2)
      expect(user.reload.active?).to be(true)
      expect(user.confirmation_required?).to be(false)
    end
  end
end
