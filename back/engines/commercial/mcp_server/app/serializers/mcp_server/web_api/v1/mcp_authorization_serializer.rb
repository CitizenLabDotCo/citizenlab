# frozen_string_literal: true

module McpServer
  module WebApi
    module V1
      # A Doorkeeper::Application (OAuth client) presented as an MCP authorization row.
      class McpAuthorizationSerializer < ::WebApi::V1::BaseSerializer
        set_type :mcp_authorization

        attribute(:client_name, &:name)
        attribute(:client_id, &:uid)
      end
    end
  end
end
