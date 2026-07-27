# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::ReadonlyStrip do
  def strip(data, schema)
    described_class.strip_readonly(data, schema)
  end

  # The schemas only declare what the walker reads (properties/items/readOnly);
  # irrelevant keywords like `type` are left out.

  it 'strips a top-level readOnly property' do
    schema = { properties: { name: {}, created_at: { readOnly: true } } }

    expect(strip({ name: 'x', created_at: 't' }, schema)).to eq(name: 'x')
  end

  it 'strips inside a nested object' do
    schema = {
      properties: {
        settings: { properties: { name: {}, updated_at: { readOnly: true } } }
      }
    }

    data = { settings: { name: 'x', updated_at: 't' } }

    expect(strip(data, schema)).to eq(settings: { name: 'x' })
  end

  it 'strips inside array items, at every nesting level' do
    schema = {
      properties: {
        fields: {
          items: {
            properties: {
              value: {},
              resource_id: { readOnly: true },
              options: { items: { properties: { label: {}, created_at: { readOnly: true } } } }
            }
          }
        }
      }
    }

    data = { fields: [{
      value: 'v',
      resource_id: 'r',
      options: [{ label: 'l', created_at: 't' }]
    }] }

    expect(strip(data, schema)).to eq(fields: [{
      value: 'v',
      options: [{ label: 'l' }]
    }])
  end

  it 'passes open objects (no declared properties) through untouched' do
    schema = {
      properties: {
        title_multiloc: { type: 'object', additionalProperties: { type: 'string' } }
      }
    }

    data = { title_multiloc: { 'en' => 'Title', 'fr-FR' => 'Titre' } }

    expect(strip(data, schema)).to eq(data)
  end

  it 'passes undeclared keys through untouched' do
    schema = { properties: { name: {} } }

    expect(strip({ name: 'x', extra: 'kept' }, schema)).to eq(name: 'x', extra: 'kept')
  end

  it 'matches string data keys against the symbol-keyed schema' do
    schema = { properties: { created_at: { readOnly: true } } }

    expect(strip({ 'created_at' => 't', 'name' => 'x' }, schema)).to eq('name' => 'x')
  end

  it 'preserves the hash class' do
    schema = { properties: { created_at: { readOnly: true } } }
    data = { 'name' => 'x', 'created_at' => 't' }.with_indifferent_access

    result = strip(data, schema)

    expect(result).to be_a(ActiveSupport::HashWithIndifferentAccess)
    expect(result[:name]).to eq('x')
  end
end
