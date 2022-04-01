require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  let(:user) { create(:user) }

  before do
    header 'Content-Type', 'application/json'
    @user = user
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  post 'web_api/v1/ideas' do
    before do
      IdeaStatus.create_defaults
    end

    with_options scope: :idea do
      parameter :custom_field_values, "a json representing custom fields"
    end

    let(:project) { create(:continuous_project) }

    describe do
    describe do
      before do
        create(:custom_field_extra_custom_form, resource: create(:custom_form, project: project))
      end

      let(:custom_field_values) { { 'extra_field' => 'test value'} }

      example_request 'Create an idea with extra fields' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(Idea.find(json_response[:data][:id]).custom_field_values.to_h). to match custom_field_values
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    before do
      @project = create(:continuous_project)
      @idea =  create(:idea, author: @user, project: @project)
    end

    with_options scope: :idea do
      parameter :custom_field_values, "a json representing custom fields"
    end
    let(:id) { @idea.id }
      describe do
        before do
          create(:custom_field_extra_custom_form, resource: create(:custom_form, project: @project))
          @idea.update! custom_field_values: { 'extra_field' => 'test value' }
        end

        let(:custom_field_values) { { 'extra_field' => 'Changed Value'} }

        example_request 'Update extra fields in an idea' do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(Idea.find(json_response[:data][:id]).custom_field_values.to_h). to match custom_field_values
        end
      end
    end
  end
end
