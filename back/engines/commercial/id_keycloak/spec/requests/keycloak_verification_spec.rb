# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'keycloak verification (ID-Porten - Oslo)' do
  # TODO: JS - We need the actual response here
  let(:auth_hash) do
    {
      'provider' => 'keycloak',
      'pid' => '23079421936',
      'locale' => 'nb',
      'info' => {
        'name' => 'Erling Haaland',
        'email' => 'erling@topscoring.com'
      },
      'credentials' => {
        'id_token' =>
        # rubocop:disable Layout/LineLength
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjhCREY3OUEzRkY5OTdFQTg1QjYyRjk1OUQzRDdCMzdFRDAyMjhFOTAifQ.eyJpc3MiOiJodHRwczovL2tvYmVuaGF2bi10ZXN0LmNyaWlwdG8uaWQiLCJhdWQiOiJ1cm46bXk6YXBwbGljYXRpb246aWRlbnRpZmllcjo0MDc3OTMiLCJub25jZSI6ImJmNTgxMWRmMGNiZjM5Mjc1NGNhMjUyYTI5YzBjYzM2IiwiaWRlbnRpdHlzY2hlbWUiOiJka21pdGlkIiwiYXV0aGVudGljYXRpb250eXBlIjoidXJuOmdybjphdXRobjpkazptaXRpZDpzdWJzdGFudGlhbCIsImF1dGhlbnRpY2F0aW9ubWV0aG9kIjoiYXBwOjE2OTI2MjE4ODg5NTY6U1VCU1RBTlRJQUw6U1VCU1RBTlRJQUw6SElHSDpISUdIIiwiYXV0aGVudGljYXRpb25pbnN0YW50IjoiMjAyMy0wOC0yMVQxMjo0NTowMS43MzNaIiwibmFtZWlkZW50aWZpZXIiOiIyOWQxNGVhMDZlMTY0NzMyODZhYzVkZTg3YTk0MTc4NCIsInN1YiI6InsyOWQxNGVhMC02ZTE2LTQ3MzItODZhYy01ZGU4N2E5NDE3ODR9Iiwic2Vzc2lvbmluZGV4IjoiNTMxNjkwY2UtOTc5Mi00OTQ5LThhMTEtZjNmNWE0YzUwNGI1IiwibG9BIjoiU1VCU1RBTlRJQUwiLCJpYWwiOiJTVUJTVEFOVElBTCIsImFhbCI6IlNVQlNUQU5USUFMIiwiZmFsIjoiSElHSCIsInV1aWQiOiI0MTBhNzdlYy00Zjg1LTQ2ZTQtYWFlZi1iZGJiZDFhOTUxZjIiLCJjcHJOdW1iZXJJZGVudGlmaWVyIjoiMzExMjc3Mjg0NiIsImJpcnRoZGF0ZSI6IjE5NzctMTItMzEiLCJkYXRlb2ZiaXJ0aCI6IjE5NzctMTItMzEiLCJhZ2UiOiI0NSIsIm5hbWUiOiJCdWxlbmdhIFBvdWxzZW4iLCJyZWZUZXh0SGVhZGVyIjoiTG9nIG9uIGF0IENyaWlwdG8iLCJyZWZUZXh0Qm9keSI6ImxvY2FsIGRldmVsb3BtZW50IHRlc3QgKEtvZW4pIiwiY291bnRyeSI6IkRLIiwiaWF0IjoxNjkyNjIxOTAyLCJuYmYiOjE2OTI2MjE5MDIsImV4cCI6MTY5MjYzOTg4OH0.1dMJe80vvEFt4EFIF2kd_Tdy5UPEEw3qGjjVuNYHhw1Oonxpjtpjm1t-Q8YiMUZ_zwsjtnZF8hoJ8PlNV_Q5f4PS0rRk7XOeYbCvwHqAUVyFdlQudXsKi7FatqsDBfBcxqNkR4Wi1kWCpGQGtPc3X2yjtBkZP7xvvOAzdOlWjL9VuI7s2LXk-TH_7SorEqKnEAIOFVD6wYLGJ0vbU-EAG3b1lAmGsPQPRNqbgrIic1ll4DEurKs76X_-Jcq4dZiRx-X2gMJ4lefU4aaBKkIyUiYdNSRtgZSN_V6J68ZzcU2UO-_PlQX8vgE7z0vRdM1wmJQIdXpQDL4PRmjpvKl_tg',
        # rubocop:enable Layout/LineLength
        'token' => 'bb7cb707-f405-43af-9f7e-b151846fd92b',
        'refresh_token' => nil,
        'expires_in' => '120',
        'scope' => nil
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
      first_name: 'Erling',
      last_name: 'Haaland',
      custom_field_values: {}
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'keycloak',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, '23079421936', 'keycloak')
    })
  end

  def expect_user_to_be_verified_and_identified(user)
    expect_user_to_be_verified(user)
    # expect(user.email).to eq 'erling@topscoring.com'
    expect(user.confirmation_required?).to be(false)
    expect(user.identities.first).to have_attributes({
      provider: 'keycloak',
      user_id: user.id,
      uid: '23079421936',
      auth_hash: nil
    })
  end

  context 'email provided in auth response' do
    it 'successfully verifies an existing user' do
      get "/auth/keycloak?token=#{@token}&random-passthrough-param=somevalue&pathname=/yipie"
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
      auth_hash['pid'] = '12345'
      OmniAuth.config.mock_auth[:keycloak] = OmniAuth::AuthHash.new(auth_hash)

      get "/auth/keycloak?token=#{token2}"
      follow_redirect!
      expect(user2.reload).to have_attributes(verified: true)
    end

    it 'fails when uid has already been used' do
      uid = '23079421936'
      create(
        :verification,
        method_name: 'keycloak',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, uid, 'keycloak')
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
        email: 'erling@topscoring.com',
        password_digest: nil
      })

      expect(response).to redirect_to('/en/?param=some-param')
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
          get "/auth/keycloak?token=#{@token}&pathname=/some-page"
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
          get "/auth/keycloak?token=#{@token}&pathname=/some-page"
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
        patch "/web_api/v1/users/#{user.id}", params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end
end
