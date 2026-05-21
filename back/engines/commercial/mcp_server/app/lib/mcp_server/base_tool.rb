# frozen_string_literal: true

class McpServer::BaseTool < MCP::Tool
  def self.to_multiloc(value)
    return value if value.is_a?(Hash)

    locale = AppConfiguration.instance.settings.dig('core', 'locales')&.first || 'en'
    { locale => value }
  end
end