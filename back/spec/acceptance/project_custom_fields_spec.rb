# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project level Custom Fields' do
  explanation 'Fields in input forms which are customized by the city, scoped to the project level.'

  before do
    header 'Content-Type', 'application/json'
  end

  describe 'in a continuous project' do
    let(:project) { create(:continuous_project) }
    let(:project_id) { project.id }

    get 'web_api/v1/projects/:project_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end
  end

  describe 'in an active phase with form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:project_id) { project.id }
    let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    get 'web_api/v1/projects/:project_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc]).to be_present
        expect(json_response[:ui_schema_multiloc]).to be_present
      end
    end
  end

  describe 'in an active phase without form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:project_id) { project.id }

    get 'web_api/v1/projects/:project_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to eq({
          json_schema_multiloc: {
            en: {
              type: 'object',
              additionalProperties: false,
              properties: {}
            },
            'fr-FR': {
              type: 'object',
              additionalProperties: false,
              properties: {}
            },
            'nl-NL': {
              type: 'object',
              additionalProperties: false,
              properties: {}
            }
          },
          ui_schema_multiloc: {
            en: { 'ui:order': [] },
            'fr-FR': { 'ui:order': [] },
            'nl-NL': { 'ui:order': [] }
          }
        })
      end
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        expect(response_body).to eq 'null'
      end
    end
  end

  describe 'outside a phase' do
    let(:project) { create(:project_with_past_phases) }
    let(:project_id) { project.id }

    get 'web_api/v1/projects/:project_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end
  end

  describe 'with an unknown project id' do
    let(:project_id) { 'unknown' }

    get 'web_api/v1/projects/:project_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 404
        expect(response_body).to be_empty
      end
    end
  end
end
