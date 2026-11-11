# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Custom field options' do
  explanation 'The options of single choice, multiple choice and ranking custom fields.'

  include_context 'common_auth'

  let_it_be(:field) { create(:custom_field_select, :with_options) }
  let_it_be(:other_field) { create(:custom_field_multiselect, :with_options) }

  get '/api/v2/custom_field_options' do
    route_summary 'List custom field options'
    route_description 'Retrieve a paginated list of the options of all custom fields.'

    include_context 'common_list_params'

    parameter(:custom_field_id, 'List only the options of a custom field.', required: false, in: 'query', type: 'string')

    example_request 'List all custom field options' do
      assert_status 200
      options = json_response_body[:custom_field_options]

      expect(options.size).to eq 4
      expect(options.first.keys).to match_array %i[
        id custom_field_id key ordering other created_at updated_at title_multiloc title
      ]
    end

    context 'when filtering by custom field' do
      let(:custom_field_id) { field.id }

      example_request 'List only the options of the custom field', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_options].pluck(:id)).to match_array field.options.ids
      end
    end
  end

  get '/api/v2/custom_field_options/:id' do
    route_summary 'Get custom field option'
    route_description 'Retrieve a single custom field option by its ID.'

    include_context 'common_item_params'

    let(:option) { field.options.first }
    let(:id) { option.id }

    example_request 'Get a custom field option' do
      assert_status 200
      expect(json_response_body[:custom_field_option])
        .to include(id: option.id, custom_field_id: field.id, key: option.key, title: 'youth council')
    end
  end

  include_examples '/api/v2/.../deleted', :custom_field_options
end
