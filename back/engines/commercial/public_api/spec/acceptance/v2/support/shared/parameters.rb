# frozen_string_literal: true

RSpec.shared_context 'common_list_params' do
  parameter :locale, 'Which locale to return text for any multi-locale fields. For example: "en" or "fr-BE". If not provided, it will be set to the default language of the platform.', in: :query, type: 'string', required: false
  parameter :page_size, 'The number of items that should be returned in one response. Defaults to 12, max 24', in: :query, required: false, type: 'integer'
  parameter :page_number, 'The page to return. Defaults to page 1', in: :query, required: false, type: 'integer'
  parameter :created_at, 'Date the item was created - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'
  parameter :updated_at, 'Date item was last updated - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'
end

RSpec.shared_context 'common_item_params' do
  parameter :locale, 'Which locale to return text for any multi-locale fields. For example: "en" or "fr-BE". If not provided, it will be set to the default language of the platform.', in: :query, type: 'string', required: false
  # TODO: Appearing twice in docs if described here too
  parameter :id, 'Unique uuid for the item', in: :path, required: true, type: 'integer'
end
