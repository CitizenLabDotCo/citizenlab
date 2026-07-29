# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Multiloc do
  subject(:host) { Class.new { include McpServer::BaseTool::Multiloc }.new }

  # No per-tenant locale enum: definitions must be identical on every tenant
  # (tool_definitions_parity_spec). Writable locales are enforced at call time by
  # McpServer::LocaleGuard instead.
  it 'builds a tenant-agnostic JSON schema' do
    expect(host.multiloc_schema).to match(
      type: 'object',
      description: be_a(String),
      additionalProperties: { type: 'string' },
      minProperties: 1
    )
  end
end
