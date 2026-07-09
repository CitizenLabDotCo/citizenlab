# frozen_string_literal: true

require 'rails_helper'

# A plain request spec, not an rspec_api_documentation acceptance spec: MCP is
# JSON-RPC over a single endpoint (no REST resources/parameters to document),
# and the API self-documents through the tool schemas served by tools/list.
describe McpServer::McpController do
  let_it_be(:user) { create(:super_admin) }

  let_it_be(:token) do
    application = Doorkeeper::Application.create!(
      name: 'MCP client',
      redirect_uri: 'https://client.example.com/callback',
      confidential: false,
      scopes: 'mcp:access'
    )

    Doorkeeper::AccessToken.create!(
      application:,
      resource_owner_id: user.id,
      scopes: 'mcp:access'
    )
  end

  let_it_be(:headers) do
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
      post(
        '/mcp',
        params: rpc('tools/list'),
        headers: headers.merge('Authorization' => 'Bearer bogus')
      )

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
      expected_names = described_class::TOOL_CLASSES.map { |klass| klass.new.name }
      expect(tool_names).to match_array(expected_names)

      # The dormant list_users tool stays unregistered until PII redaction is sorted.
      expect(tool_names).not_to include('list_users')
    end
  end

  describe 'tools/call' do
    it 'runs a tool end to end' do
      area = create(:area)

      params = rpc('tools/call', { name: 'list_areas', arguments: {} })
      post('/mcp', params:, headers:)

      expect(response).to have_http_status(:ok)
      expect(rpc_result['isError']).to be_falsey
      expect(rpc_result.dig('structuredContent', 'data').pluck('id')).to eq([area.id])
      expect(rpc_result['content'].first['type']).to eq('text')
    end

    # Tool runners trust their input: the controller configures the server to validate
    # arguments against each tool's input_schema at dispatch. Pin that this actually
    # rejects non-conforming input, using a feature-gated enum value (the Runners have
    # no runtime flag checks, so schema validation is the only gate).
    it 'rejects arguments that do not conform to the input schema' do
      SettingsService.new.deactivate_feature!('polls')
      project = create(:project, :draft)
      arguments = {
        project_id: project.id,
        title_multiloc: { 'en' => 'P1' },
        start_at: '2026-07-01',
        participation_method: 'poll'
      }

      params = rpc('tools/call', { name: 'create_phase', arguments: })
      post('/mcp', params:, headers:)

      expect(response).to have_http_status(:ok)

      expect(rpc_result['isError']).to be(true)
      expect(rpc_result['content'].sole['text'])
        .to include('Invalid arguments', "'#/participation_method'")

      expect(project.reload.phases.count).to eq(0)
    end
  end
end
