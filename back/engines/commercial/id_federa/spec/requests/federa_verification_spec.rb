# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'federa verification' do
  context 'when test mode is enabled' do
    let(:user_uid) { 'TINIT-ABCDEF12G34H567I' }
    let(:auth_hash) do
      {
        'provider' => 'federa',
        'uid' => 'federa-uid-123',
        'info' =>
          { 'name' => nil,
            'email' => nil,
            'nickname' => nil,
            'first_name' => nil,
            'last_name' => nil,
            'image' => nil },
        'credentials' => {},
        'extra' =>
          { 'raw_info' =>
              { 'name' => 'Mario',
                'familyName' => 'Rossi',
                'email' => 'mario.rossi@example.org',
                'domicileMunicipality' => '1234',
                'dateOfBirth' => '1980-01-01',
                'fiscalNumber' => user_uid,
                'spidCode' => nil },
            'response_object' => '<saml:Response>...</saml:Response>' }
      }
    end

    before do
      @user = create(:user, first_name: 'Mario', last_name: 'Rossi')
      @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

      # Create user custom fields that will be filled by the auth hash
      create(:custom_field, key: 'birthyear', resource_type: 'User')
      create(:custom_field, key: 'domicile_municipality', resource_type: 'User')

      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

      configuration = AppConfiguration.instance
      settings = configuration.settings

      settings['federa_login'] = {
        'allowed' => true,
        'enabled' => true
      }

      settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{
          name: 'federa',
          environment: 'test',
          spid_level: '1',
          private_key: 'A_KEY',
          enabled_for_verified_actions: true
        }]
      }
      configuration.save!
      host! 'example.org'
    end

    def expect_user_to_be_verified(user, first_name: 'Mario', last_name: 'Rossi')
      expect(user.reload).to have_attributes({
        verified: true,
        first_name:,
        last_name:
      })
      expect(user.verifications.first).to have_attributes({
        method_name: 'federa',
        user_id: user.id,
        active: true,
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, user_uid, 'federa')
      })
    end

    def expect_user_to_be_verified_and_identified(user, first_name: 'Mario', last_name: 'Rossi')
      expect_user_to_be_verified(user, first_name:, last_name:)
      expect(user.identities.first).to have_attributes({
        provider: 'federa',
        user_id: user.id,
        uid: user_uid
      })
      expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider credentials]
    end

    it 'successfully verifies a user', skip: 'Still under development' do
      get "/auth/federa?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
      follow_redirect!

      expect_user_to_be_verified(@user)

      expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')
    end

    it 'successfully authenticates a user that was previously verified' do
      get "/auth/federa?token=#{@token}"
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(0)
      expect_user_to_be_verified(@user)

      get '/auth/federa'
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.identities.count).to eq(1)
      expect_user_to_be_verified_and_identified(@user)
    end

    it 'successfully verifies another user with another Federa account (different UID)' do
      get "/auth/federa?token=#{@token}"
      follow_redirect!
      expect(@user.reload).to have_attributes({
        verified: true
      })

      user2 = create(:user)
      token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
      auth_hash['extra']['raw_info']['fiscalNumber'] = 'TINIT-ZYXWVU98T76S543R'
      OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

      get "/auth/federa?token=#{token2}"
      follow_redirect!
      expect(user2.reload).to have_attributes(verified: true)
    end

    it 'successfully authenticates a user that was previously authenticated and updates the stored auth_hash' do
      get '/auth/federa'
      follow_redirect!
      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)
      expect(user.identities.first.auth_hash['extra']['raw_info']['email']).to eq('mario.rossi@example.org')

      # Change the auth hash so we can check that it is updated
      auth_hash['extra']['raw_info']['email'] = 'mario.rossi@newmail.org'
      OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

      get '/auth/federa'
      follow_redirect!
      expect_user_to_be_verified_and_identified(user)
      expect(user.identities.first.auth_hash['extra']['raw_info']['email']).to eq('mario.rossi@newmail.org')
    end

    it 'does not persist response_object in the stored auth_hash' do
      get '/auth/federa'
      follow_redirect!

      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)
      expect(user.identities.first.auth_hash['extra']).not_to have_key('response_object')
    end

    it 'fails when UID has already been used' do
      create(
        :verification,
        method_name: 'federa',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, user_uid, 'federa')
      )

      get "/auth/federa?token=#{@token}"
      follow_redirect!

      expect(@user.reload).to have_attributes(verified: false)
    end

    it 'creates user when the authentication token is not passed', skip: 'Still under development' do
      expect(User.count).to eq(1)
      get '/auth/federa?param=something'
      follow_redirect!

      expect(User.count).to eq(2)

      user = User.order(created_at: :asc).last
      expect_user_to_be_verified_and_identified(user)

      expect(user).not_to eq(@user)
      expect(user).to have_attributes({
        first_name: 'Mario',
        last_name: 'Rossi'
      })

      expect(response).to redirect_to('/en/?param=something&sso_flow=signup&sso_success=true')
    end

    it 'does not send email to empty address (when just registered)' do
      auth_hash['extra']['raw_info']['email'] = nil
      OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

      get '/auth/federa'
      follow_redirect!

      expect(ActionMailer::Base.deliveries).to be_empty
    end

    context 'when verification is already taken by new user' do
      before do
        get '/auth/federa'
        follow_redirect!
      end

      let!(:new_user) do
        User.order(created_at: :asc).last.tap do |user|
          expect_user_to_be_verified_and_identified(user)
        end
      end

      context 'when verified registration is completed by new user' do
        before { new_user.update!(email: Faker::Internet.email) }

        it 'does not verify another user and does not delete previously verified new user', skip: 'Still under development' do
          get "/auth/federa?token=#{@token}&verification_pathname=/some-page"
          follow_redirect!

          expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
          expect(@user.reload).to have_attributes({
            verified: false,
            first_name: 'Mario',
            last_name: 'Rossi'
          })

          expect(new_user.reload).to eq(new_user)
        end
      end

      context 'when verified registration is not completed by new user' do
        it 'successfully verifies another user and deletes previously verified blank new user', skip: 'Still under development' do
          get "/auth/federa?token=#{@token}&verification_pathname=/some-page"
          follow_redirect!

          expect(response).to redirect_to('/en/some-page?verification_success=true')
          expect_user_to_be_verified(@user.reload)
          expect { new_user.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    describe 'update email after registration with Federa' do
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

      context 'email confirmation enabled' do
        before do
          # Register with no email from Federa
          auth_hash['extra']['raw_info']['email'] = nil
          OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

          configuration = AppConfiguration.instance
          configuration.settings['user_confirmation'] = {
            'enabled' => true,
            'allowed' => true
          }
          configuration.save!
        end

        it 'creates user that can add and confirm her email' do
          get '/auth/federa'
          follow_redirect!

          user = User.order(created_at: :asc).last
          expect_user_to_be_verified_and_identified(user)

          headers = { 'Authorization' => authorization_header(user) }

          expect(user.email).to be_nil
          expect(user.active?).to be(true)
          expect(user.confirmation_required?).to be(false)
          expect(ActionMailer::Base.deliveries.count).to eq(0)

          post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: 'newcoolemail@example.org' } }, headers: headers
          expect(response).to have_http_status(:ok)
          expect(user.reload).to have_attributes({ new_email: 'newcoolemail@example.org' })
          expect(user.confirmation_required?).to be(true)
          expect(ActionMailer::Base.deliveries.count).to eq(1)

          post '/web_api/v1/user/confirm_code_email_change', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
          expect(response).to have_http_status(:ok)
          expect(user.reload.confirmation_required?).to be(false)
          expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
        end

        it 'allows users to be active without adding an email & confirmation' do
          get '/auth/federa'
          follow_redirect!

          get '/auth/federa'
          follow_redirect!

          user = User.order(created_at: :asc).last
          expect_user_to_be_verified_and_identified(user)
          expect(user.email).to be_nil
          expect(user.confirmation_required?).to be(false)
          expect(user.active?).to be(true)
        end
      end

      context 'email confirmation disabled' do
        before do
          auth_hash['extra']['raw_info']['email'] = nil
          OmniAuth.config.mock_auth[:federa] = OmniAuth::AuthHash.new(auth_hash)

          configuration = AppConfiguration.instance
          configuration.settings['user_confirmation'] = {
            'enabled' => false,
            'allowed' => false
          }
          configuration.save!
        end

        it 'creates user that can update her email' do
          get '/auth/federa'
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

  context 'when test mode is disabled' do
    before do
      configuration = AppConfiguration.instance
      settings = configuration.settings

      settings['federa_login'] = {
        'allowed' => true,
        'enabled' => true
      }

      settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{
          name: 'federa',
          environment: 'test',
          spid_level: '1',
          private_key: 'A_KEY',
          enabled_for_verified_actions: true
        }]
      }
      configuration.save!
      host! 'example.org'
    end

    it 'redirects to the service with correct SAML parameters' do
      OmniAuth.config.test_mode = false
      get "/auth/federa?token=#{@token}"
      expect(response).to have_http_status(:redirect)
      redirect_url = URI.parse(response.location)
      expect(redirect_url.host).to eq('federatest.lepida.it')
      query_params = Rack::Utils.parse_query(redirect_url.query)
      expect(query_params).to have_key('SAMLRequest')
      expect(query_params).to have_key('RelayState')
      # TODO: Add in tests for sigalg and signature when those are implemented
    end
  end
end
