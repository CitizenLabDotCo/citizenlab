# frozen_string_literal: true

module McpServer
  class McpController < ActionController::API
    before_action :check_feature_flag!
    before_action -> { doorkeeper_authorize! 'mcp:access' }
    after_action :advertise_resource_metadata, if: -> { response.unauthorized? }

    def create
      server = MCP::Server.new(
        name: 'citizenlab',
        version: '0.1.0',
        tools: [
          McpServer::Tools::HelloWorld,
          McpServer::Tools::CreateEvent
        ],
        server_context: { current_user: }
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

    def check_feature_flag!
      return if AppConfiguration.instance.feature_activated?('mcp_server')

      head :unauthorized
    end

    # RFC 9728 §5.1: a 401 from a protected resource must point clients to the
    # resource-metadata document via the WWW-Authenticate header so they can
    # discover the authorization server and start the OAuth flow.
    def advertise_resource_metadata
      metadata_url = "#{request.base_url}/.well-known/oauth-protected-resource"
      existing = response.headers['WWW-Authenticate'].to_s
      challenge = "Bearer resource_metadata=\"#{metadata_url}\""
      response.headers['WWW-Authenticate'] = existing.present? ? "#{existing}, #{challenge}" : challenge
    end

    def current_user
      @current_user ||= User.find(doorkeeper_token.resource_owner_id)
    end
  end
end
