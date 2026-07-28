# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Multiloc do
  subject(:host) { Class.new { include McpServer::BaseTool::Multiloc }.new }

  it 'builds a JSON schema restricted to the tenant locales' do
    expect(host.multiloc_schema).to match(
      type: 'object',
      description: be_a(String),
      propertyNames: { enum: %w[en fr-FR nl-NL] },
      additionalProperties: { type: 'string' },
      minProperties: 1
    )
  end
end
