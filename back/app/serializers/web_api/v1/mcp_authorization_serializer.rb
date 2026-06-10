# frozen_string_literal: true

# A Doorkeeper::Application (OAuth client) presented as an MCP authorization row.
class WebApi::V1::McpAuthorizationSerializer < WebApi::V1::BaseSerializer
  set_type :mcp_authorization

  attribute(:client_name, &:name)
  attribute(:client_id, &:uid)
end
