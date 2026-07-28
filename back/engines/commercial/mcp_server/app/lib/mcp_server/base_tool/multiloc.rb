# frozen_string_literal: true

# Schema helper for multiloc fields.
#
# Deliberately tenant-agnostic: tool definitions must be identical on every tenant so
# the cross-tenant staff gateway can serve a single tool list for all of them (guarded
# by tool_definitions_parity_spec). Which locales are actually writable is enforced at
# call time by LocaleGuard, with an error naming the active locales.
module McpServer::BaseTool::Multiloc
  def multiloc_schema
    {
      type: 'object',
      description: 'Localized text. An object mapping locale codes to their translations. ' \
                   'Keys must be locales that are active on the platform; other keys are rejected.',
      additionalProperties: { type: 'string' },
      minProperties: 1
    }
  end
end
