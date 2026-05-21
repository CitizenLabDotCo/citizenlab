# frozen_string_literal: true

class McpServer::McpPolicy < ::ApplicationPolicy
  def create?
    return unless AppConfiguration.instance.feature_activated?('mcp_server')

    user.active? && user.super_admin?
  end
end
