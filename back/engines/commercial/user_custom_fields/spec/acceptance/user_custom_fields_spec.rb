require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "User Custom Fields" do

  explanation "Fields in forms (e.g. registration) which are customized by the city."

  before do
    header "Content-Type", "application/json"
    @custom_fields = create_list(:custom_field, 3)
  end

  get "web_api/v1/users/custom_fields" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of custom fields per page"
    end
    parameter :input_types, "Array of input types. Only return custom fields for the given types. Allowed values: #{CustomField::INPUT_TYPES.join(", ")}", required: false

    example_request "List all custom fields" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    describe "do filter on input types" do
      before do
        create(:custom_field_multiselect)
        create(:custom_field_checkbox)
        create(:custom_field_date)
      end

      let(:input_types) { ['multiselect', 'checkbox'] }

      example_request "List custom fields filtered by input types" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end

  get "web_api/v1/users/custom_fields/:id" do
    let(:id) { @custom_fields.first.id }

    example_request "Get one custom field by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @custom_fields.first.id
    end
  end

  get "web_api/v1/users/custom_fields/schema" do
    example_request "Get the react-jsonschema-form json schema and ui schema for the custom fields" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:json_schema_multiloc)).to be_present
      expect(json_response.dig(:ui_schema_multiloc)).to be_present
    end
  end

  get "web_api/v1/users/custom_fields/json_forms_schema" do
    example_request "Get the jsonforms.io json schema and ui schema for the custom fields" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:json_schema_multiloc)).to be_present
      expect(json_response.dig(:ui_schema_multiloc)).to be_present
    end
  end

  context "when authenticated as admin" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/users/custom_fields" do
      with_options scope: :custom_field do
        parameter :key, "A unique internal name for the field. Only letters, numbers and underscores allowed. Auto-generated from the title if not provided. Can't be changed afterwards", required: false
        parameter :input_type, "The type of input presented to the user. One of #{CustomField::INPUT_TYPES.join(", ")}. Can't be changed afterwards", required: true
        parameter :title_multiloc, "The title of the field as shown to users, in multiple locales", required: true
        parameter :description_multiloc, "An optional description of the field, as shown to users, in multiple locales", required: false
        parameter :required, "Whether filling out the field is mandatory. Defaults to false", required: false
        parameter :enabled, "Whether the field is active or not. Defaults to true", required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:custom_field) { build(:custom_field, enabled: false) }

      describe do
        let(:key) { custom_field.key }
        let(:input_type) { custom_field.input_type }
        let(:title_multiloc) { custom_field.title_multiloc }
        let(:description_multiloc) { custom_field.description_multiloc }
        let(:required) { custom_field.required }
        let(:enabled) { custom_field.enabled }

        example_request "Create a custom field" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:key)).to match key
          expect(json_response.dig(:data,:attributes,:input_type)).to match input_type
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data,:attributes,:hidden)).to be false
          expect(json_response.dig(:data,:attributes,:required)).to match required
          expect(json_response.dig(:data,:attributes,:enabled)).to match enabled
        end
      end

      describe do
        let(:key) { "No spaces allowed" }
        let(:title_multiloc) { {'en' => ""} }

        example_request "[error] Create an invalid custom field", document: false do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :key)).to eq [{error: 'invalid', value: key}]
          expect(json_response.dig(:errors, :title_multiloc)).to eq [{error: 'blank'}]
        end
      end
    end

    patch "web_api/v1/users/custom_fields/:id" do
      with_options scope: :custom_field do
        parameter :title_multiloc, "The title of the field as shown to users, in multiple locales", required: false
        parameter :description_multiloc, "An optional description of the field, as shown to users, in multiple locales", required: false
        parameter :required, "Whether filling out the field is mandatory", required: false
        parameter :enabled, "Whether the field is active or not", required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:id) { create(:custom_field).id }
      let(:title_multiloc) { {"en" => "New title"} }
      let(:description_multiloc) { {"en" => "New description"} }
      let(:required) { true }
      let(:enabled) { false }

      example_request "Update a custom field" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:required)).to match required
        expect(json_response.dig(:data,:attributes,:enabled)).to match enabled
      end
    end

    patch "web_api/v1/users/custom_fields/:id/reorder" do
      with_options scope: :custom_field do
        parameter :ordering, "The position, starting from 0, where the field should be at. Fields after will move down.", required: true
      end

      let(:id) { create(:custom_field).id }
      let(:ordering) { 1 }

      example_request "Reorder a custom field" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:ordering)).to match ordering
        expect(CustomField.with_resource_type('User').order(:ordering)[1].id).to eq id
        expect(CustomField.with_resource_type('User').order(:ordering).map(&:ordering)).to eq (0..3).to_a
      end
    end

    delete "web_api/v1/users/custom_fields/:id" do
      let(:custom_field) { create(:custom_field) }
      let(:id) { custom_field.id }

      example_request "Delete a custom field" do
        expect(response_status).to eq 200
        expect{CustomField.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end

      if CitizenLab.ee?
        example "[error] Delete a custom field that's still referenced in a rules group" do
          group = create(:smart_group, rules: [
            {ruleType: 'custom_field_text', customFieldId: id, predicate: 'is_empty'}
          ])
          do_request
          expect(response_status).to eq 422
          expect(CustomField.find(id)).to be_present
        end
      end
    end
  end
end
