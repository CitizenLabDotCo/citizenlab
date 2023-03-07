# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Token' do
  explanation 'User Token via JWT.'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/user_token' do
    with_options scope: :auth do
      parameter :email, required: true
      parameter :password, required: false
      parameter :remember_me, required: false
    end

    context 'when a password is used' do
      let(:email) { 'test@email.com' }
      let(:password) { '12345678' }
      let(:remember_me) { false }

      before do
        create(:user, email: email, password: password)
        allow(Time).to receive(:now).and_return(Time.now)
      end

      example_request 'Create JWT token with 1 day expiration' do
        expect(status).to eq(201)

        jwt = JWT.decode(json_response_body[:jwt], nil, false).first
        expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
      end

      context 'when remember_me is sent' do
        let(:remember_me) { true }

        example_request 'Create JWT token with default expiration' do
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

          example_request 'Create JWT token with expiration from settings' do
            expect(status).to eq(201)

            jwt = JWT.decode(json_response_body[:jwt], nil, false).first
            expect(jwt['exp']).to eq((Time.now + token_lifetime.days).to_i)
          end
        end
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
            create(:user_with_confirmation, email: email, password: nil)
            allow(Time).to receive(:now).and_return(Time.now)
          end

          example_request 'Create a JWT token with 1 day expiration' do
            expect(status).to eq(201)

            jwt = JWT.decode(json_response_body[:jwt], nil, false).first
            expect(jwt['exp']).to eq((Time.now + 1.day).to_i)
          end
        end

        context 'when email has already been confirmed' do
          before do
            create(:user, email: email, password: nil)
          end

          example_request 'No JWT token is returned' do
            expect(status).to eq(404)
          end
        end
      end

      context 'when the user has a password set and confirmation is required' do
        before do
          create(:user, email: email, password: 'monkeynuts123')
        end

        example_request 'No JWT token is returned' do
          expect(status).to eq(404)
        end
      end
    end
  end
end
