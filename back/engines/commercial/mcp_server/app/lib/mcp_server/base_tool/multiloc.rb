# frozen_string_literal: true

# Schema helper for multiloc fields.
module McpServer::BaseTool::Multiloc
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
