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
        Tokens used to claim participation data created while not logged in. 
      DESC
    end

    context 'when a password is used' do
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

      before do
        SettingsService.new.activate_feature! 'user_confirmation'
      end

      context 'when the user has no password set' do
        context 'when confirmation is still required' do
          before do
            create(:user_no_password, email: email)
            allow(Time).to receive(:now).and_return(Time.now)
          end

          example_request 'create a JWT token with 1 day expiration' do
            assert_status 201

            jwt = JWT.decode(json_response_body[:jwt], nil, false).first
            expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
          end
        end

        context 'when email has already been confirmed' do
          before do
            user = create(:user_no_password, email: email)
            user.confirm!
          end

          example_request 'no JWT token is returned' do
            assert_status 404
          end
        end
      end

      context 'when the user has a password set and confirmation is required' do
        before do
          create(:user_with_confirmation, email: email, password: 'monkeynuts123')
        end

        example_request 'no JWT token is returned' do
          expect(status).to eq(404)
        end
      end
    end
  end
end
