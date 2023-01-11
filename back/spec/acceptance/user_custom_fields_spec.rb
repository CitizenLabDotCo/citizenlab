# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Fields' do
  explanation 'Fields in forms (e.g. registration).'

  before do
    header 'Content-Type', 'application/json'
    @custom_fields = create_list(:custom_field, 3)
  end

  get 'web_api/v1/users/custom_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of custom fields per page'
    end
    parameter :input_types, "Array of input types. Only return custom fields for the given types. Allowed values: #{CustomField::INPUT_TYPES.join(', ')}", required: false

    example_request 'List all custom fields' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    describe 'do filter on input types' do
      before do
        create(:custom_field_multiselect)
        create(:custom_field_checkbox)
        create(:custom_field_date)
      end

      let(:input_types) { %w[multiselect checkbox] }

      example_request 'List custom fields filtered by input types' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end

  get 'web_api/v1/users/custom_fields/:id' do
    let(:id) { custom_field.id }
    let(:expected_response) do
      {
        id: id,
        type: 'user_custom_field',
        attributes: {
          key: custom_field.key,
          input_type: custom_field.input_type,
          title_multiloc: custom_field.title_multiloc,
          description_multiloc: custom_field.description_multiloc,
          required: custom_field.required?,
          hidden: custom_field.hidden?,
          enabled: custom_field.enabled?,
          ordering: custom_field.ordering,
          code: custom_field.code,
          created_at: custom_field.created_at.as_json,
          updated_at: custom_field.updated_at.as_json,
          logic: {}
        },
        relationships: {
          options: {
            data: custom_field.options.map do |option|
              { id: option.id, type: 'custom_field_option' }
            end
          }
        }
      }.deep_symbolize_keys
    end
  end

  get 'web_api/v1/users/custom_fields/schema' do
    before do
      create(:custom_field)
    end

    example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:json_schema_multiloc]).to be_present
      expect(json_response[:ui_schema_multiloc]).to be_present
    end
  end

  get 'web_api/v1/users/custom_fields/json_forms_schema' do
    before do
      create(:custom_field)
    end

    example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:json_schema_multiloc]).to be_present
      expect(json_response.dig(:json_schema_multiloc, :en, :properties).size).to eq 4
      expect(json_response[:ui_schema_multiloc]).to be_present
      expect(json_response.dig(:ui_schema_multiloc, :en, :type)).to eq 'VerticalLayout'
    end
  end

  context 'when authenticated as admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    patch 'web_api/v1/users/custom_fields/:id' do
      with_options scope: :custom_field do
        parameter :required, 'Whether filling out the field is mandatory', required: false
        parameter :enabled, 'Whether the field is active or not', required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:id) { create(:custom_field).id }
      let(:required) { true }
      let(:enabled) { false }

      example_request 'Update a custom field' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :required)).to match required
        expect(json_response.dig(:data, :attributes, :enabled)).to match enabled
      end
    end

    patch 'web_api/v1/users/custom_fields/:id/reorder' do
      with_options scope: :custom_field do
        parameter :ordering, 'The position, starting from 0, where the field should be at. Fields after will move down.', required: true
      end

      let(:id) { create(:custom_field).id }
      let(:ordering) { 1 }

      example_request 'Reorder a custom field' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(CustomField.with_resource_type('User').order(:ordering)[1].id).to eq id
        expect(CustomField.with_resource_type('User').order(:ordering).map(&:ordering)).to eq (0..3).to_a
      end
    end
  end
end
