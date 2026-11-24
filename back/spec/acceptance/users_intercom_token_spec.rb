# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  let(:secret) { 'intercom-messenger-secret' }

  def stub_secret(value)
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('INTERCOM_MESSENGER_SECRET', nil).and_return(value)
  end

  before do
    header 'Content-Type', 'application/json'
    stub_secret(secret)
    SettingsService.new.activate_feature!('intercom')
  end

  get 'web_api/v1/users/me/intercom_token' do
    context 'when not authenticated' do
      example_request '[error] Get an Intercom Messenger token without authentication' do
        assert_status 401
      end
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      before { header_token_for user }

      example_request 'Get an Intercom Messenger token for the current user' do
        assert_status 200
        token = json_parse(response_body).dig(:data, :attributes, :token)
        payload, = JWT.decode(token, secret, true, algorithm: 'HS256')
        expect(payload['user_id']).to eq user.id
        expect(payload['email']).to eq user.email
        expect(payload.dig('company', 'company_id')).to eq Tenant.current.id
      end

      example '[error] Get an Intercom Messenger token when the intercom feature is not active' do
        SettingsService.new.deactivate_feature!('intercom')
        do_request
        assert_status 401
      end

      example '[error] Get an Intercom Messenger token when the secret is missing' do
        stub_secret(nil)
        do_request
        assert_status 401
      end
    end

    context 'when project moderator' do
      let(:user) { create(:project_moderator) }

      before { header_token_for user }

      example_request 'Get an Intercom Messenger token as a project moderator' do
        assert_status 200
        expect(json_parse(response_body).dig(:data, :attributes, :token)).to be_present
      end
    end

    context 'when normal user' do
      before { header_token_for create(:user) }

      example_request '[error] Get an Intercom Messenger token as a normal user' do
        assert_status 401
      end
    end
  end
end
