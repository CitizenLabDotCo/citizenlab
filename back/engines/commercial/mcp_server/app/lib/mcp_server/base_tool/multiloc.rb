# frozen_string_literal: true

module McpServer
  class BaseTool < MCP::Tool
    module Multiloc
      extend ActiveSupport::Concern

      class_methods do
        def multiloc_schema
          locales = AppConfiguration.instance.settings.dig('core', 'locales') || []
          {
            type: 'object',
            description: 'Localized text. An object mapping locale codes to their translations.',
            propertyNames: { enum: locales },
            additionalProperties: { type: 'string' },
            minProperties: 1
          }
        end
      end
    end
  end
end
