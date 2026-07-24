# frozen_string_literal: true

require 'rails_helper'

describe McpServer::InternalMcpController do
  let(:tenant_host) { 'example.org' } # the test tenant
  let(:headers) do
    {
      'Authorization' => ENV.fetch('ADMIN_API_TOKEN'),
      'X-Tenant-Host' => tenant_host,
      'CONTENT_TYPE' => 'application/json',
      'ACCEPT' => 'application/json, text/event-stream'
    }
  end

  let!(:internal_account) do
    create(:admin, email: described_class::INTERNAL_ACCOUNT_EMAIL)
  end

  def rpc_body(method, params = nil)
    { jsonrpc: '2.0', id: 1, method: method, params: params }.compact.to_json
  end

  before { SettingsService.new.activate_feature!('mcp_server') }

  describe 'tools/list' do
    it 'returns the same tool set as the public MCP endpoint' do
      post '/admin_api/mcp', params: rpc_body('tools/list'), headers: headers

      expect(response).to have_http_status(:ok)
      tool_names = response.parsed_body.dig('result', 'tools').pluck('name')
      expect(tool_names).to include('list_projects', 'create_project', 'run_reporting_sql_query')
      expect(tool_names.size).to eq(McpServer::McpController::TOOL_CLASSES.size)
    end
  end

  describe 'tools/call' do
    let!(:project) { create(:project) }

    it 'runs the tool in the tenant selected by X-Tenant-Host' do
      post '/admin_api/mcp',
        params: rpc_body('tools/call', { name: 'list_projects', arguments: {} }),
        headers: headers

      expect(response).to have_http_status(:ok)
      content = response.parsed_body.dig('result', 'content')
      expect(content.to_json).to include(project.id)
    end

    it 'logs an activity attributed to the acting user, with the staff identity in the payload' do
      expect do
        post '/admin_api/mcp',
          params: rpc_body('tools/call', { name: 'list_projects', arguments: {} }),
          headers: headers.merge('X-Acting-Staff' => 'someone@govocal.com')
      end.to have_enqueued_job(LogActivityJob).with(
        internal_account,
        'internal_mcp_tool_call',
        internal_account,
        anything,
        payload: { tool: 'list_projects', acting_staff: 'someone@govocal.com' }
      )
    end
  end

  describe 'acting user resolution' do
    it 'prefers the staff account matching X-Acting-Staff when it is an eligible super admin' do
      staff = create(:super_admin)

      expect do
        post '/admin_api/mcp',
          params: rpc_body('tools/call', { name: 'list_projects', arguments: {} }),
          headers: headers.merge('X-Acting-Staff' => staff.email)
      end.to have_enqueued_job(LogActivityJob).with(
        staff, 'internal_mcp_tool_call', staff, anything, anything
      )
    end

    it 'falls back to the internal account when the staff account is not a super admin' do
      non_admin_staff = create(:user, email: 'regular@govocal.com')

      expect do
        post '/admin_api/mcp',
          params: rpc_body('tools/call', { name: 'list_projects', arguments: {} }),
          headers: headers.merge('X-Acting-Staff' => non_admin_staff.email)
      end.to have_enqueued_job(LogActivityJob).with(
        internal_account, 'internal_mcp_tool_call', internal_account, anything, anything
      )
    end

    context 'when no eligible acting user exists on the tenant' do
      let!(:internal_account) { nil }

      it 'responds with 403' do
        post '/admin_api/mcp', params: rpc_body('tools/list'), headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body['error']).to include('acting user')
      end
    end
  end

  describe 'authentication and tenant selection' do
    it 'rejects a wrong token' do
      post '/admin_api/mcp',
        params: rpc_body('tools/list'),
        headers: headers.merge('Authorization' => 'wrong-token')

      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects an unknown tenant host' do
      post '/admin_api/mcp',
        params: rpc_body('tools/list'),
        headers: headers.merge('X-Tenant-Host' => 'unknown.example.net')

      expect(response).to have_http_status(:not_found)
    end

    it 'rejects a missing tenant host header' do
      post '/admin_api/mcp', params: rpc_body('tools/list'), headers: headers.except('X-Tenant-Host')

      expect(response).to have_http_status(:not_found)
    end

    context 'when the mcp_server feature is not activated' do
      before do
        settings = AppConfiguration.instance.settings
        settings['mcp_server'] = { 'allowed' => true, 'enabled' => false }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'responds with 403' do
        post '/admin_api/mcp', params: rpc_body('tools/list'), headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body['error']).to include('mcp_server feature')
      end
    end
  end

  describe 'protocol handshake' do
    it 'handles initialize' do
      initialize_params = {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'rspec', version: '1.0' }
      }

      post '/admin_api/mcp', params: rpc_body('initialize', initialize_params), headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig('result', 'serverInfo', 'name')).to eq('go_vocal_internal')
    end
  end
end
