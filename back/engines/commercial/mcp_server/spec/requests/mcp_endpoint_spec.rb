# frozen_string_literal: true

require 'rails_helper'

# Covers the transport wiring in McpController#create — in particular the
# mcp >= 0.23 DNS-rebinding Host validation and our allowed_hosts config.
# The test tenant host is 'example.org' (non-loopback), so these specs exercise
# the real hosted-host allow path, which a localhost dev run cannot.
describe McpServer::McpController do
  let(:user) { create(:super_admin) }

  let(:oauth_app) do
    Doorkeeper::Application.create!(
      name: 'Test MCP Client', redirect_uri: 'https://client.example.com/cb', confidential: false
    )
  end

  let(:token) do
    Doorkeeper::AccessToken.create!(
      resource_owner_id: user.id, application: oauth_app, scopes: 'mcp:access', expires_in: 7200
    )
  end

  let(:headers) do
    {
      # Doorkeeper is configured with hash_token_secrets, so the raw secret is only
      # available via plaintext_token on the freshly-built record (token.token is hashed).
      'Authorization' => "Bearer #{token.plaintext_token}",
      'CONTENT_TYPE' => 'application/json',
      'ACCEPT' => 'application/json, text/event-stream'
    }
  end

  let(:initialize_body) do
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'rspec', version: '1.0' }
      }
    }.to_json
  end

  before { SettingsService.new.activate_feature!('mcp_server') }

  context 'when the request Host matches the tenant host' do
    it 'passes DNS-rebinding validation and handles the request' do
      host! 'example.org' # == AppConfiguration.instance.host

      post '/mcp', params: initialize_body, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include('result')
    end
  end

  context 'when the request Host is not an allowed host' do
    it 'is rejected by DNS-rebinding protection before reaching the tools' do
      host! 'attacker.example.net'

      post '/mcp', params: initialize_body, headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end
end
