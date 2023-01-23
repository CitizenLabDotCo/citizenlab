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
      parameter :remember_me, required: false
    end

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
end
