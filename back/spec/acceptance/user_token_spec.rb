# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Token' do
  explanation 'User Token via JWT.'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/user_token' do
    with_options scope: :auth do
      parameter :email, required: true
      parameter :password, required: true
      parameter :remember_me
      parameter :claim_tokens, <<~DESC
        Tokens used to claim anonymous participation data (e.g., ideas) created while logged out.
        If confirmation is required, tokens are marked as pending until confirmed.
        Otherwise, participation data is claimed immediately.
      DESC
    end

    context 'when the email domain has SSO enforced' do
      before do
        settings = AppConfiguration.instance.settings
        settings['id_config'] = {
          'allowed' => true,
          'enabled' => true,
          'id_methods' => [
            { 'name' => 'azureactivedirectory', 'enforced_email_domains' => 'example.com' }
          ]
        }
        AppConfiguration.instance.update!(settings: settings)
      end

      let(:email) { 'user@example.com' }
      let(:password) { '12345678' }
      let!(:user) { create(:user, email: email, password: password) }

      example_request 'Returns 422 with sso_enforced_for_domain error' do
        assert_status 422
        expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('sso_enforced_for_domain')
      end
    end

    context 'when user is confirmed' do
      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }
      let(:remember_me) { false }

      let!(:user) { create(:user, email: email, password: password) }

      before do
        allow(Time).to receive(:now).and_return(Time.now)
      end

      example_request 'Create JWT token creates expected payload' do
        assert_status 201

        jwt = JWT.decode(json_response_body[:jwt], nil, false).first

        expect(jwt['sub']).to eq(user.id)
        expect(jwt['highest_role']).to eq('user')
        expect(jwt['cluster']).to eq('local')
        expect(jwt['tenant']).to eq(Tenant.current.id)
        expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
      end

      context 'when the user is an admin' do
        let!(:user) { create(:admin, email: email, password: password) }

        example_request 'Create JWT token for admin' do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first

          expect(jwt['sub']).to eq(user.id)
          expect(jwt['highest_role']).to eq('admin')
        end
      end

      context 'when the user is a project moderator' do
        let!(:user) { create(:project_moderator, email: email, password: password) }

        example_request 'Create JWT token for project moderator' do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first

          expect(jwt['sub']).to eq(user.id)
          expect(jwt['highest_role']).to eq('project_moderator')
        end
      end

      context 'when the user is a folder moderator' do
        let!(:user) { create(:project_folder_moderator, email: email, password: password) }

        example_request 'Create JWT token for project folder moderator' do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first

          expect(jwt['sub']).to eq(user.id)
          expect(jwt['highest_role']).to eq('project_folder_moderator')
        end
      end

      example_request 'Create JWT token with 1 day expiration' do
        assert_status 201

        jwt = JWT.decode(json_response_body[:jwt], nil, false).first

        expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
      end

      context 'when remember_me is sent' do
        let(:remember_me) { true }

        example_request 'create JWT token with default expiration' do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first
          expect(jwt['exp']).to eq((Time.now + 30.days).to_i)
        end

        context 'when authentication_token_lifetime_in_days is configured' do
          before do
            config = AppConfiguration.instance
            config.settings['core']['authentication_token_lifetime_in_days'] = token_lifetime
            config.save!
          end

          let(:token_lifetime) { 8 }

          example_request 'create JWT token with expiration from settings' do
            assert_status 201

            jwt = JWT.decode(json_response_body[:jwt], nil, false).first
            expect(jwt['exp']).to eq((Time.now + token_lifetime.days).to_i)
          end
        end

        context 'when password login is turned off' do
          before { SettingsService.new.deactivate_feature! 'password_login' }

          example '[error] does not allow a regular user to log in with a password', document: false do
            do_request
            assert_status 404
          end

          example '[error] does not allow a regular admin in with a password', document: false do
            user.update!(roles: [{ type: 'admin' }])
            do_request
            assert_status 404
          end

          context 'super admin' do
            let(:email) { 'hello@citizenlab.co' }

            example 'allows a super admin to log in with a password', document: false do
              user.update!(email: email, roles: [{ type: 'admin' }])
              do_request
              assert_status 201
            end
          end
        end
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }
        let(:claim_tokens) { [claim_token.token] }

        example 'claims participation data on login', document: false do
          expect(idea.author_id).to be_nil

          do_request
          assert_status 201

          expect(idea.reload.author_id).to eq(user.id)
          expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      example 'Does not create JWT token with invalid password' do
        do_request(auth: { email: email, password: 'wrongpassword' })
        assert_status 404
      end
    end

    context 'when the user is unconfirmed' do
      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }
      let(:remember_me) { false }

      let!(:user) { create(:unconfirmed_user, email: email, password: password) }

      before do
        allow(Time).to receive(:now).and_return(Time.now)
      end

      example_request '[error] no JWT token is returned' do
        assert_status 404
      end
    end

    context 'when the user is an invited user' do
      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }

      before do
        create(:invited_user, email: email, password: password)
      end

      example_request '[error] no JWT token is returned' do
        assert_status 404
      end
    end

    # Logging in without a password must NEVER work, whatever the state of the user.
    # Do not relax these expectations: they are the last line of defence of password login.
    context 'when no password is used' do
      let(:email) { 'test@email.com' }
      let(:password) { '' }

      context 'when user has password' do
        let!(:user) { create(:user, email: email, password: 'other_password') }

        example_request '[error] no JWT token is returned' do
          assert_status 404
        end
      end

      context 'when user has no password' do
        let!(:user) { create(:unconfirmed_user, email: email) }

        example_request '[error] no JWT token is returned' do
          assert_status 404
        end
      end

      context 'when user has no password and is confirmed' do
        let!(:user) do
          create(:unconfirmed_user, email: email).tap { |u| u.find_or_create_confirmation(:email_confirmation).confirm! }
        end

        example '[error] no JWT token is returned', document: false do
          expect(user.reload.confirmation_required?).to be false

          do_request
          assert_status 404
        end
      end

      context 'when user has no password and is a super admin' do
        let(:email) { 'hello@citizenlab.co' }
        let!(:user) do
          create(:unconfirmed_user, email: email, roles: [{ type: 'admin' }])
            .tap { |u| u.find_or_create_confirmation(:email_confirmation).confirm! }
        end

        example '[error] no JWT token is returned', document: false do
          expect(user.super_admin?).to be true

          do_request
          assert_status 404
        end
      end

      context 'when the password is omitted entirely' do
        let!(:user) { create(:unconfirmed_user, email: email).tap { |u| u.find_or_create_confirmation(:email_confirmation).confirm! } }

        example '[error] no JWT token is returned', document: false do
          do_request(auth: { email: email })
          assert_status 404
        end
      end

      context 'when the password is blank whitespace' do
        let!(:user) { create(:unconfirmed_user, email: email).tap { |u| u.find_or_create_confirmation(:email_confirmation).confirm! } }

        example '[error] no JWT token is returned', document: false do
          do_request(auth: { email: email, password: '   ' })
          assert_status 404
        end
      end
    end

    context 'when password_login is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'password_login'
        allow(Time).to receive(:now).and_return(Time.now)
      end

      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }
      let(:remember_me) { false }

      let!(:user) { create(:user, email: email, password: password) }

      example_request '[error] no JWT token is returned' do
        assert_status 404
      end

      context do
        let!(:user) { create(:super_admin, password: password) }
        let!(:email) { user.email }

        example_request 'does allow a super admin to log in with a password' do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first
          expect(jwt['sub']).to eq(user.id)
        end
      end
    end

    # This endpoint only allows authentication by email address
    context 'when the user confirmed their phone number but not their email address' do
      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }

      let!(:user) do
        create(:unconfirmed_user, email: email, password: password).tap do |u|
          u.update!(phone: '+14155552671', phone_confirmed_at: Time.zone.now)
        end
      end

      example_request '[error] no JWT token is returned' do
        expect(user.reload.confirmation_required?).to be true
        assert_status 404
      end
    end

    context 'when a phone number is sent instead of an email address' do
      include_context 'with sms feature enabled'

      let(:email) { nil }
      let(:password) { '12345678' }

      let!(:user) { create(:user, :with_confirmed_phone, phone: '+14155552671', password: password) }

      example '[error] no JWT token is returned', document: false do
        do_request(auth: { phone: '+14155552671', password: password })
        assert_status 404
      end
    end
  end

  post 'web_api/v1/user_token_phone' do
    explanation 'User Token via JWT, for users logging in with a phone number instead of an email address.'

    include_context 'with sms feature enabled'

    with_options scope: :auth do
      parameter :phone, required: true
      parameter :password, required: true
      parameter :remember_me
      parameter :claim_tokens, <<~DESC
        Tokens used to claim anonymous participation data (e.g., ideas) created while logged out.
      DESC
    end

    let(:password) { '12345678' }
    let(:phone) { '+14155552671' }

    context 'when the phone number is confirmed' do
      let!(:user) { create(:user, :with_confirmed_phone, phone: '+14155552671', password: password) }

      example_request 'Creates a JWT token' do
        assert_status 201

        jwt = JWT.decode(json_response_body[:jwt], nil, false).first
        expect(jwt['sub']).to eq(user.id)
      end

      context 'when the number is submitted in a different format' do
        let(:phone) { '+1 (415) 555-2671' }

        example_request 'Creates a JWT token', document: false do
          assert_status 201
          expect(JWT.decode(json_response_body[:jwt], nil, false).first['sub']).to eq(user.id)
        end
      end

      context 'when remember_me is sent' do
        let(:remember_me) { true }

        before { allow(Time).to receive(:now).and_return(Time.now) }

        example_request 'Creates a JWT token with default expiration', document: false do
          assert_status 201

          jwt = JWT.decode(json_response_body[:jwt], nil, false).first
          expect(jwt['exp']).to eq((Time.now + 30.days).to_i)
        end
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }
        let(:claim_tokens) { [claim_token.token] }

        example 'claims participation data on login', document: false do
          expect(idea.author_id).to be_nil

          do_request
          assert_status 201

          expect(idea.reload.author_id).to eq(user.id)
        end
      end

      example '[error] no JWT token is returned with an invalid password', document: false do
        do_request(auth: { phone: phone, password: 'wrongpassword' })
        assert_status 404
      end

      context 'when the sms feature is disabled' do
        before { SettingsService.new.deactivate_feature! 'sms' }

        example_request '[error] no JWT token is returned', document: false do
          assert_status 404
        end
      end

      context 'when password_login is disabled' do
        before { SettingsService.new.deactivate_feature! 'password_login' }

        example_request '[error] no JWT token is returned', document: false do
          assert_status 404
        end
      end
    end

    # The counterpart of the email endpoint: this one only looks at the phone
    # number, so a confirmed email address does not unlock an unconfirmed number.
    context 'when the phone number is not confirmed' do
      let!(:user) { create(:user, phone: '+14155552671', password: password) }

      example_request '[error] no JWT token is returned' do
        expect(user.phone_confirmed_at).to be_nil
        expect(user.confirmation_required?).to be false
        assert_status 404
      end
    end

    # A user who signed up with their phone number has no email address at all,
    # so `confirmation_required` stays true forever. It must not block them.
    context 'when the user has no email address' do
      let!(:user) do
        create(:unconfirmed_phone_user, phone: '+14155552671').tap do |u|
          u.find_or_create_confirmation(:phone_confirmation).confirm!
          u.update!(password: password)
        end
      end

      example_request 'Creates a JWT token' do
        expect(user.reload.confirmation_required?).to be true

        assert_status 201
        expect(JWT.decode(json_response_body[:jwt], nil, false).first['sub']).to eq(user.id)
      end
    end

    # Passwordless users authenticate with an empty password. They log in
    # through confirm_code_phone, never here.
    context 'when the user has no password' do
      let!(:user) { create(:unconfirmed_phone_user, phone: '+14155552671') }
      let(:password) { '' }

      before { user.find_or_create_confirmation(:phone_confirmation).confirm! }

      example_request '[error] no JWT token is returned' do
        assert_status 404
      end

      example '[error] no JWT token is returned when a password is guessed', document: false do
        do_request(auth: { phone: phone, password: 'some_password' })
        assert_status 404
      end
    end

    context 'when the user is an invited user' do
      let!(:user) do
        create(:invited_user, password: password).tap do |u|
          u.update!(phone: '+14155552671', phone_confirmed_at: Time.zone.now)
        end
      end

      example_request '[error] no JWT token is returned', document: false do
        assert_status 404
      end
    end

    context 'when no user has that phone number' do
      example_request '[error] no JWT token is returned', document: false do
        assert_status 404
      end
    end

    context 'when the phone number is invalid' do
      let(:phone) { 'not-a-number' }

      example_request '[error] no JWT token is returned', document: false do
        assert_status 404
      end
    end

    context 'when an email address is sent instead of a phone number' do
      let!(:user) { create(:user, password: password) }
      let(:phone) { nil }

      example '[error] no JWT token is returned', document: false do
        do_request(auth: { email: user.email, password: password })
        assert_status 404
      end
    end
  end
end
