# frozen_string_literal: true

module McpServer
  class McpController < ActionController::API
    before_action :check_feature_flag!

    def create
      server = MCP::Server.new(
        name: 'citizenlab',
        version: '0.1.0',
        tools: [McpServer::Tools::HelloWorld]
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
  end
end
