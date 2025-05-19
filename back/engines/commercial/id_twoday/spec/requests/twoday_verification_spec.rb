# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'Twoday verification (BankID - Helsingborg)' do
  let(:auth_hash) do
    {
      'provider' => 'twoday',
      'uid' => 'f531d7e453bd58c1c47a9cea135d1626342ae142e44ebb17424a38142e4d1f66',
      'info' => {
        'name' => 'Nils Eriksson',
        'email' => nil,
        'email_verified' => nil,
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
    OmniAuth.config.mock_auth[:twoday] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'twoday',
        domain: 'some.test.domain.com',
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
      first_name: 'Nils',
      last_name: 'Eriksson',
      custom_field_values: {}
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'twoday',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, auth_hash['uid'], 'twoday')
    })
  end

  def expect_user_to_be_verified_and_identified(user)
    expect_user_to_be_verified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'twoday',
      user_id: user.id,
      uid: auth_hash['uid']
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  context 'email NOT provided in auth response (always true)' do
    before do
      configuration = AppConfiguration.instance
      configuration.settings['password_login'] = {
        'allowed' => true,
        'enabled' => true,
        'enable_signup' => true,
        'minimum_length' => 8
      }
      configuration.save!
    end

    context 'when verification is already taken by a new user with no email' do
      before do
        get '/auth/twoday'
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
          get "/auth/twoday?token=#{@token}&verification_pathname=/some-page"
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
          get "/auth/twoday?token=#{@token}&verification_pathname=/some-page"
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
        configuration.settings['user_confirmation'] = { 'enabled' => true, 'allowed' => true }
        configuration.save!
      end

      it 'creates user that can add & confirm her email' do
        get '/auth/twoday'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.active?).to be(true)
        expect(user.confirmation_required?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(0)

        headers = { 'Authorization' => authorization_header(user) }

        patch "/web_api/v1/users/#{user.id}", params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(true)
        expect(user.active?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(1)

        post '/web_api/v1/user/confirm', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
        expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.new_email).to be_nil
      end

      it 'allows users to be active without adding an email & confirmation' do
        get '/auth/twoday'
        follow_redirect!

        get '/auth/twoday'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
      end

      it 'does not send email to empty email address (when just registered)' do
        get '/auth/twoday'
        follow_redirect!

        expect(ActionMailer::Base.deliveries).to be_empty
      end
    end

    context 'email confirmation disabled' do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = { 'enabled' => false, 'allowed' => false }
        configuration.save!
      end

      it 'creates user that can update her email' do
        get '/auth/twoday'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)

        token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
        headers = { 'Authorization' => "Bearer #{token}" }
        patch "/web_api/v1/users/#{user.id}", params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end
end
