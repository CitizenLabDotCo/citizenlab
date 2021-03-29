require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Idea Custom Fields" do

  explanation "Fields in idea forms which are customized by the city, scoped on the project level."

  before do
    header "Content-Type", "application/json"
  end

  context "when authenticated as admin" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/projects/:project_id/custom_fields" do
      let(:project) { create(:project) }
      let(:project_id) { project.id }

      example_request "List all custom fields for a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 7
      end

    end

    get "web_api/v1/projects/:project_id/custom_fields/:id" do
      let(:custom_field) { create(:custom_field, :for_custom_form) }
      let(:id) { custom_field.id }

      example_request "Get one custom field by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end

    patch "web_api/v1/projects/:project_id/custom_fields/by_code/:code" do
      with_options scope: :custom_field do
        parameter :required, "Whether filling out the field is mandatory", required: false
        parameter :enabled, "Whether the field is active or not", required: false
        parameter :description_multiloc, "An optional description of the field, as shown to users, in multiple locales", required: false
      end

      let(:project_id) { project.id }
      let(:code) { 'location' }
      let(:required) { true }
      let(:enabled) { false }
      let(:description_multiloc) { {"en" => "New description"} }

      context "when the custom_form doesn't exist yet" do
        let(:project) { create(:project) }

        example "Update a built-in custom field", document: false do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:code)).to eq code
          expect(json_response.dig(:data,:attributes,:required)).to eq required
          expect(json_response.dig(:data,:attributes,:enabled)).to eq enabled
          expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
          expect(CustomField.count).to eq 1
          expect(CustomForm.count).to eq 1
          expect(project.reload.custom_form).to eq CustomForm.first
        end
      end

      context "when the custom_form already exists" do
        let(:custom_form) { create(:custom_form) }
        let(:project) { create(:project, custom_form: custom_form) }

        context "when the field was not persisted yet" do
          example_request "Update a built-in custom field" do
            expect(response_status).to eq 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data,:attributes,:code)).to eq code
            expect(json_response.dig(:data,:attributes,:required)).to eq required
            expect(json_response.dig(:data,:attributes,:enabled)).to eq enabled
            expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
            expect(CustomField.count).to eq 1
          end
        end

        context "when the field is already persisted" do
          example "Update a built-in custom field", document: false do
            cf = create(:custom_field, resource: custom_form, code: code)
            do_request
            expect(response_status).to eq 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data,:id)).to eq cf.id
            expect(json_response.dig(:data,:attributes,:code)).to eq code
            expect(json_response.dig(:data,:attributes,:required)).to eq required
            expect(json_response.dig(:data,:attributes,:enabled)).to eq enabled
            expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
            expect(CustomField.count).to eq 1
          end
        end
      end

    end

  end
end
