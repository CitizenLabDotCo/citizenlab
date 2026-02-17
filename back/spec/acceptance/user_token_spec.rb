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

    context 'when user_confirmation is enabled' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
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
            expect(status).to eq(201)

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
              expect(status).to eq(201)

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
          expect(status).to eq(404)
        end
      end

      context 'when the user is unconfirmed' do
        let(:email) { 'test@email.com' }
        let(:password) { '12345678' }
        let(:remember_me) { false }

        let!(:user) { create(:user_with_confirmation, email: email, password: password) }

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
          let!(:user) { create(:user_no_password, email: email) }

          example_request '[error] no JWT token is returned' do
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
    end

    context 'when user_confirmation is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'user_confirmation'
      end

      context 'when the user is unconfirmed' do
        let(:email) { 'test@email.com' }
        let(:password) { '12345678' }
        let(:remember_me) { false }

        let!(:user) { create(:user_with_confirmation, email: email, password: password) }

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
          let!(:user) { create(:user_no_password, email: email) }

          example_request '[error] no JWT token is returned' do
            assert_status 404
          end
        end
      end
    end
  end

  post 'web_api/v1/user_token/unconfirmed' do
    with_options scope: :auth do
      parameter :email, required: true
    end

    context 'when user_confirmation is enabled' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
      end

      example 'user has no password' do
        user = create(:user_no_password)
        do_request(auth: { email: user.email })
        expect(status).to eq(404)
      end
    end

    context 'when user_confirmation is disabled' do
      before do
        SettingsService.new.deactivate_feature! 'user_confirmation'
      end

      example 'user has no password' do
        user = create(:user_no_password)
        do_request(auth: { email: user.email })
        expect(status).to eq(201)

        jwt = JWT.decode(json_response_body[:jwt], nil, false).first

        expect(jwt['sub']).to eq(user.id)
        expect(jwt['highest_role']).to eq('user')
        expect(jwt['cluster']).to eq('local')
        expect(jwt['tenant']).to eq(Tenant.current.id)
        expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
      end

      example 'when user has password' do
        user = create(:user)
        do_request(auth: { email: user.email })
        expect(status).to eq(422)
      end

      example 'when user does not exist' do
        do_request(auth: { email: 'random@email.com' })
        expect(status).to eq(404)
      end
    end
  end
end
