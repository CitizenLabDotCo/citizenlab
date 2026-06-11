# frozen_string_literal: true

module McpServer
  class McpController < ActionController::API
    include Pundit::Authorization
    rescue_from(Pundit::NotAuthorizedError) { head :forbidden }

    around_action :authorize_mcp_access

    def create
      authorize(%i[mcp_server mcp])

      server = MCP::Server.new(
        name: 'go_vocal',
        title: "Go Vocal (#{AppConfiguration.instance.host})",
        version: '0.1.0',
        tools: tools
      )

      transport = MCP::Server::Transports::StreamableHTTPTransport.new(
        server,
        stateless: true,
        enable_json_response: true
      )

      status, headers, body = transport.handle_request(request)
      self.status = status
      self.response_body = body
      headers.each { |k, v| response.set_header(k, v) }
    end

    private

    # Authorize via Doorkeeper, and append the RFC 9728 resource_metadata parameter to the
    # WWW-Authenticate header on 401s so MCP clients can discover the OAuth authorization
    # server. Uses around_action to add the header (instead of a simpler after_action)
    # because doorkeeper_authorize! responds with head :unauthorized on invalid tokens,
    # which causes Rails to skip after_actions.
    def authorize_mcp_access
      doorkeeper_authorize! 'mcp:access'
      yield unless performed?
    ensure
      advertise_resource_metadata if response.unauthorized?
    end

    # RFC 9728 §5.1: a 401 from a protected resource must point clients to the
    # resource-metadata document via the WWW-Authenticate header so they can
    # discover the authorization server and start the OAuth flow.
    def advertise_resource_metadata
      metadata_url = "#{AppConfiguration.instance.base_backend_uri}/.well-known/oauth-protected-resource"
      existing = response.headers['WWW-Authenticate'].to_s
      challenge = "Bearer resource_metadata=\"#{metadata_url}\""
      response.headers['WWW-Authenticate'] = existing.present? ? "#{existing}, #{challenge}" : challenge
    end

    def tools
      @tools ||= [
        McpServer::Tools::CreateProject,
        McpServer::Tools::CreatePhase,
        McpServer::Tools::CreateEvent,
        McpServer::Tools::CreateCause,
        McpServer::Tools::CreatePollQuestion,
        McpServer::Tools::CreatePollOption,
        McpServer::Tools::UpdateResource,
        McpServer::Tools::GetResource,
        McpServer::Tools::ListProjects,
        McpServer::Tools::ListPhases,
        McpServer::Tools::ListEvents,
        McpServer::Tools::ListCauses,
        McpServer::Tools::ListPollQuestions,
        McpServer::Tools::ListAreas,
        McpServer::Tools::ListGlobalTopics,
        McpServer::Tools::ListFolders,
        # TODO: re-enable once PII redaction is sorted (drop email, redact last_name, etc.).
        # Also restore the default_assignee_id field on create_project (dropped since the
        # LLM has no way to look up user IDs without this tool).
        # McpServer::Tools::ListUsers,
        McpServer::Tools::ListPhasePermissions,
        McpServer::Tools::UpdatePhasePermission,
        McpServer::Tools::ListUserCustomFields,
        McpServer::Tools::ListGroups
      ].map { |klass| klass.for(current_user:, token_scopes:) }
    end

    def current_user
      @current_user ||= User.find(doorkeeper_token.resource_owner_id)
    end

    def token_scopes
      doorkeeper_token.scopes.to_a
    end
  end
end
