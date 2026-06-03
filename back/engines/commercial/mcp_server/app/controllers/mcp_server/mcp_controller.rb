# frozen_string_literal: true

module McpServer
  class McpController < ActionController::API
    include Pundit::Authorization
    rescue_from(Pundit::NotAuthorizedError) { head :forbidden }

    before_action -> { doorkeeper_authorize! 'mcp:access' }
    after_action :advertise_resource_metadata, if: -> { response.unauthorized? }

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

    # RFC 9728 §5.1: a 401 from a protected resource must point clients to the
    # resource-metadata document via the WWW-Authenticate header so they can
    # discover the authorization server and start the OAuth flow.
    def advertise_resource_metadata
      metadata_url = "#{request.base_url}/.well-known/oauth-protected-resource"
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
        McpServer::Tools::GetResource,
        McpServer::Tools::ListProjects,
        McpServer::Tools::ListPhases,
        McpServer::Tools::ListEvents,
        McpServer::Tools::ListCauses,
        McpServer::Tools::ListAreas,
        McpServer::Tools::ListGlobalTopics,
        McpServer::Tools::ListFolders,
        # TODO: re-enable once PII redaction is sorted (drop email, redact last_name, etc.).
        # Also restore the default_assignee_id field on create_project (dropped since the
        # LLM has no way to look up user IDs without this tool).
        # McpServer::Tools::ListUsers,
        McpServer::Tools::ListPhasePermissions,
        McpServer::Tools::UpdatePhasePermission,
        McpServer::Tools::ListUserCustomFields
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
