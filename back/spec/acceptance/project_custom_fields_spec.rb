# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project level Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped to the project level.'

  before do
    header 'Content-Type', 'application/json'
  end

  let(:built_in_field_keys) do
    %i[
      title_multiloc
      body_multiloc
      author_id
      budget
      proposed_budget
      topic_ids
      location_description
      idea_images_attributes
      idea_files_attributes
    ]
  end
  let(:visible_built_in_field_keys) do
    %i[
      title_multiloc
      body_multiloc
      topic_ids
      location_description
      idea_images_attributes
      idea_files_attributes
    ]
  end
  let(:project_id) { project.id }

  def verify_schema(json_response, field_keys)
    expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
    %i[en fr-FR nl-NL].each do |locale|
      expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq field_keys
    end
    expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
  end

  context 'without extra idea custom fields' do
    describe 'in a continuous project' do
      let(:project) { create(:continuous_project) }

      get 'web_api/v1/projects/:project_id/custom_fields/schema' do
        example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, built_in_field_keys
        end
      end

      get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
        example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, visible_built_in_field_keys
        end
      end
    end

    describe 'in a project with an active phase' do
      let(:project) { create(:project_with_active_native_survey_phase) }

      get 'web_api/v1/projects/:project_id/custom_fields/schema' do
        example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, built_in_field_keys
        end
      end

      get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
        example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, visible_built_in_field_keys
        end
      end
    end
  end

  context 'with idea custom fields' do
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    if CitizenLab.ee?
      let(:expected_jsonschema_form_field_keys) do
        built_in_field_keys + [custom_field.key.to_sym]
      end
      let(:expected_json_forms_field_keys) do
        visible_built_in_field_keys + [custom_field.key.to_sym]
      end
    else
      let(:expected_jsonschema_form_field_keys) do
        built_in_field_keys
      end
      let(:expected_json_forms_field_keys) do
        visible_built_in_field_keys
      end
    end

    describe 'in a continuous project' do
      let(:project) { create(:continuous_project) }

      get 'web_api/v1/projects/:project_id/custom_fields/schema' do
        example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, expected_jsonschema_form_field_keys
        end
      end

      get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
        example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, expected_json_forms_field_keys
        end
      end
    end

    describe 'in a project with an active phase' do
      let(:project) { create(:project_with_active_native_survey_phase) }

      get 'web_api/v1/projects/:project_id/custom_fields/schema' do
        example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, expected_jsonschema_form_field_keys
        end
      end

      get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
        example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          verify_schema json_response, expected_json_forms_field_keys
        end
      end
    end
  end
end
