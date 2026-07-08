# frozen_string_literal: true

require 'rails_helper'

describe 'POST /mcp' do
  let(:user) { create(:super_admin) }
  let(:application) do
    Doorkeeper::Application.create!(
      name: 'MCP client',
      redirect_uri: 'https://client.example.com/callback',
      confidential: false,
      scopes: 'mcp:access'
    )
  end
  let(:token) do
    Doorkeeper::AccessToken.create!(application:, resource_owner_id: user.id, scopes: 'mcp:access')
  end
  let(:headers) do
    {
      'Authorization' => "Bearer #{token.plaintext_token}",
      'Content-Type' => 'application/json',
      'Accept' => 'application/json, text/event-stream'
    }
  end

  before { SettingsService.new.activate_feature!('mcp_server') }

  def rpc(method, params = {})
    { jsonrpc: '2.0', id: 1, method:, params: }.to_json
  end

  def rpc_result
    JSON.parse(response.body)['result']
  end

  describe 'authorization gating' do
    it 'returns 401 with the RFC 9728 resource-metadata challenge when no token is given' do
      post '/mcp', params: rpc('tools/list'), headers: headers.except('Authorization')

      expect(response).to have_http_status(:unauthorized)
      expect(response.headers['WWW-Authenticate'])
        .to include('resource_metadata="', '/.well-known/oauth-protected-resource')
    end

    it 'returns 401 for an invalid token' do
      post '/mcp', params: rpc('tools/list'), headers: headers.merge('Authorization' => 'Bearer bogus')

      expect(response).to have_http_status(:unauthorized)
      expect(response.headers['WWW-Authenticate']).to include('resource_metadata=')
    end

    it 'refuses a token without the mcp:access scope' do
      token.update!(scopes: 'public')

      post('/mcp', params: rpc('tools/list'), headers:)

      expect(response).to have_http_status(:forbidden)
    end

    it 'refuses a token whose owner is not a super admin' do
      token.update!(resource_owner_id: create(:admin).id)

      post('/mcp', params: rpc('tools/list'), headers:)

      expect(response).to have_http_status(:forbidden)
    end

    it 'refuses when the mcp_server feature is disabled' do
      SettingsService.new.deactivate_feature!('mcp_server')

      post('/mcp', params: rpc('tools/list'), headers:)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'tools/list' do
    it 'lists every registered tool' do
      post('/mcp', params: rpc('tools/list'), headers:)

      expect(response).to have_http_status(:ok)

      tool_names = rpc_result['tools'].pluck('name')
      expect(tool_names.size).to eq(McpServer::McpController::TOOL_CLASSES.size)
      expect(tool_names).to include('create_project', 'list_projects', 'destroy_resource')
      expect(tool_names).not_to include('list_users')
    end
  end

  describe 'tools/call' do
    it 'runs a tool end to end' do
      area = create(:area)

      post('/mcp', params: rpc('tools/call', { name: 'list_areas', arguments: {} }), headers:)

      expect(response).to have_http_status(:ok)
      expect(rpc_result['isError']).to be_falsey
      expect(rpc_result.dig('structuredContent', 'data').pluck('id')).to eq([area.id])
      expect(rpc_result['content'].first['type']).to eq('text')
    end
  end
end
