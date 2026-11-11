# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Custom field matrix statements' do
  explanation 'The statements (rows) of matrix custom fields, each answered on a linear scale.'

  include_context 'common_auth'

  let_it_be(:field) { create(:custom_field_matrix_linear_scale) }
  let_it_be(:other_field) { create(:custom_field_matrix_linear_scale) }

  get '/api/v2/custom_field_matrix_statements' do
    route_summary 'List custom field matrix statements'
    route_description 'Retrieve a paginated list of the statements of all matrix custom fields.'

    include_context 'common_list_params'

    parameter(:custom_field_id, 'List only the statements of a custom field.', required: false, in: 'query', type: 'string')

    example_request 'List all custom field matrix statements' do
      assert_status 200
      statements = json_response_body[:custom_field_matrix_statements]

      expect(statements.pluck(:id)).to match_array CustomFieldMatrixStatement.ids
      expect(statements.first.keys).to match_array %i[
        id custom_field_id key ordering created_at updated_at title_multiloc title
      ]
    end

    context 'when filtering by custom field' do
      let(:custom_field_id) { field.id }

      example_request 'List only the statements of the custom field', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_matrix_statements].pluck(:id)).to match_array field.matrix_statements.ids
      end
    end
  end

  get '/api/v2/custom_field_matrix_statements/:id' do
    route_summary 'Get custom field matrix statement'
    route_description 'Retrieve a single custom field matrix statement by its ID.'

    include_context 'common_item_params'

    let(:statement) { field.matrix_statements.first }
    let(:id) { statement.id }

    example_request 'Get a custom field matrix statement' do
      assert_status 200
      expect(json_response_body[:custom_field_matrix_statement])
        .to include(id: statement.id, custom_field_id: field.id, key: statement.key)
    end
  end

  include_examples '/api/v2/.../deleted', :custom_field_matrix_statements
end
