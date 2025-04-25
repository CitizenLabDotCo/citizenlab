# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project level Custom Fields' do
  explanation 'Fields in input forms which are customized by the city, scoped to the project level.'

  before do
    header 'Content-Type', 'application/json'
  end

  let(:schemas_without_fields) do
    {
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
    }
  end

  describe 'in an active ideation phase with custom fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:project_id) { project.id }
    let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let!(:custom_field) { create(:custom_field, resource: custom_form) }
    let(:enabled_built_in_field_keys) do
      %i[
        title_multiloc
        body_multiloc
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
      ]
    end
    let(:expected_jsonschema_form_field_keys) { enabled_built_in_field_keys + [custom_field.key.to_sym] }
    let(:expected_json_forms_field_keys) do
      invisible_field_keys = %i[proposed_budget]
      enabled_built_in_field_keys - invisible_field_keys + [custom_field.key.to_sym]
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc].keys).to match_array %i[en fr-FR nl-NL]
        %i[en fr-FR nl-NL].each do |locale|
          expect(json_attributes[:json_schema_multiloc][locale][:properties].keys).to match_array expected_json_forms_field_keys
        end
        expect(json_attributes[:ui_schema_multiloc].keys).to match_array %i[en fr-FR nl-NL]
      end
    end
  end

  describe 'in an active ideation phase without custom fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:project_id) { project.id }

    before do
      project.phases.first.update!(input_term: 'question')
    end

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc].keys).to match_array %i[en fr-FR nl-NL]
        %i[en fr-FR nl-NL].each do |locale|
          expect(json_attributes[:json_schema_multiloc][locale][:properties].keys).to match_array(
            %i[title_multiloc body_multiloc topic_ids location_description idea_images_attributes idea_files_attributes]
          )
        end
        ui_schema = json_attributes[:ui_schema_multiloc][:en]
        expect(ui_schema.keys).to match_array %i[type options elements]
        expect(ui_schema[:type]).to eq 'Categorization'
        expect(ui_schema[:options]).to eq({ formId: 'idea-form', inputTerm: 'question' })
        expect(ui_schema[:elements].size).to eq 5
        expect(json_attributes[:ui_schema_multiloc].keys).to match_array %i[en fr-FR nl-NL]
      end
    end
  end

  describe 'when there is no current phase' do
    let(:project) { create(:project_with_past_phases) }
    let(:project_id) { project.id }

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
      end
    end
  end

  describe 'with an unknown project id' do
    let(:project_id) { 'unknown' }

    get 'web_api/v1/projects/:project_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 404
        expect(response_body).to be_empty
      end
    end
  end
end
