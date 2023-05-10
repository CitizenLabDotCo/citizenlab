# frozen_string_literal: true

RSpec.shared_context 'common_parameters' do
  authentication :apiKey, 'Api Key', name: 'API_AUTH', description: 'Some description'

  # Shared parameters between APIs - move out
  parameter :locale, 'Which locale to return text for any multi-locale fields. For example: "en" or "fr-BE"', in: :path, type: 'string', required: true
  parameter :page_size, 'The number of items that should be returned in one response. Defaults to 12, max 24', in: :query, required: false, type: 'integer'
  parameter :page_number, 'The page to return. Defaults to page 1', in: :query, required: false, type: 'integer'
  parameter :id, 'Unique uuid for the item', in: :query, required: false, type: 'integer'
  parameter :created_at, 'date the item was created - can filter between dates', in: :query, required: false, type: 'string'
  parameter :updated_at, 'date item was last updated - can filter between dates', in: :query, required: false, type: 'string'
end
