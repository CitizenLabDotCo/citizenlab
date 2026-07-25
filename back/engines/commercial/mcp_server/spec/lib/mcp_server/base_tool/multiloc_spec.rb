# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Multiloc do
  subject(:host) { Class.new { include McpServer::BaseTool::Multiloc }.new }

  it 'restricts the property names to the tenant locales' do
    locales = AppConfiguration.instance.settings.dig('core', 'locales')

    schema = host.multiloc_schema

    expect(locales).to be_present
    expect(schema[:propertyNames]).to eq(enum: locales)
    expect(schema[:minProperties]).to eq(1)
    expect(schema[:additionalProperties]).to eq(type: 'string')
  end
end
