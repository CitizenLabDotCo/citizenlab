require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Post Custom Fields" do

  explanation "Fields in post forms which are customized by the city, scoped on the project level."

  before do
    header "Content-Type", "application/json"
  end


  # get "web_api/v1/projects/:project_id/custom_fields/schema" do
  #   example_request "Get the json schema and ui schema for the custom fields" do
  #     expect(status).to eq 200
  #     json_response = json_parse(response_body)
  #     expect(json_response.dig(:json_schema_multiloc)).to be_present
  #     expect(json_response.dig(:ui_schema_multiloc)).to be_present
  #   end
  # end

  context "when authenticated as admin" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end
  
    get "web_api/v1/projects/:project_id/custom_fields" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of custom fields per page"
      end

      let(:project) { create(:project) }
      let(:project_id) { project.id }

      example_request "List all custom fields for a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end

    end

    get "web_api/v1/projects/:project_id/custom_fields/:id" do
      let(:custom_field) { create(:custom_field, :for_post_form) }
      let(:id) { custom_field.id }

      example_request "Get one custom field by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end

    # patch "web_api/v1/projects/:project_id/custom_fields/:id" do
    #   with_options scope: :custom_field do
    #     parameter :description_multiloc, "An optional description of the field, as shown to users, in multiple locales", required: false
    #   end
    #   ValidationErrorHelper.new.error_fields(self, CustomField)

    #   let(:post_form) { create(:post_form) }
    #   let(:project) { create(:project, post_form: post_form) }
    #   let(:project_id) { project.id }
    #   let(:id) { create(:custom_field, resource: post_form).id }
    #   let(:description_multiloc) { {"en" => "New description"} }

    #   example_request "Update a custom field" do
    #     expect(response_status).to eq 200
    #     json_response = json_parse(response_body)
    #     expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
    #   end
    # end

    patch "web_api/v1/projects/:project_id/custom_fields/by_code/:code" do
      with_options scope: :custom_field do
        parameter :description_multiloc, "An optional description of the field, as shown to users, in multiple locales", required: false
      end

      let(:project_id) { project.id }
      let(:code) { 'title' }
      let(:description_multiloc) { {"en" => "New description"} }

      context "when the post_form doesn't exist yet" do
        let(:project) { create(:project) }

        example "Update a built-in custom field", document: false do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:code)).to eq code
          expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
          expect(CustomField.count).to eq 1
          expect(PostForm.count).to eq 1
          expect(project.reload.post_form).to eq PostForm.first
        end
      end

      context "when the post_form already exists" do
        let(:post_form) { create(:post_form) }
        let(:project) { create(:project, post_form: post_form) }

        context "when the field was not persisted yet" do
          example_request "Update a built-in custom field" do
            expect(response_status).to eq 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data,:attributes,:code)).to eq code
            expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
            expect(CustomField.count).to eq 1
          end
        end

        context "when the field is already persisted" do
          example "Update a built-in custom field", document: false do
            cf = create(:custom_field, :for_post_form, code: code)
            do_request
            expect(response_status).to eq 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data,:id)).to eq cf.id
            expect(json_response.dig(:data,:attributes,:code)).to eq code
            expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
            expect(CustomField.count).to eq 1
          end
        end
      end

    end

  end
end
