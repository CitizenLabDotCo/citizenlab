# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase level Custom Fields' do
  explanation 'Fields in input forms which are customized by the city, scoped to the phases level.'

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
        'fr-BE': {
          type: 'object',
          additionalProperties: false,
          properties: {}
        },
        'nl-BE': {
          type: 'object',
          additionalProperties: false,
          properties: {}
        }
      },
      ui_schema_multiloc: {
        en: { 'ui:order': [] },
        'fr-BE': { 'ui:order': [] },
        'nl-BE': { 'ui:order': [] }
      }
    }
  end

  describe 'in an ideation phase with form fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase) { project.phases.first }
    let(:phase_id) { phase.id }
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    before do
      phase.update!(input_term: 'question')
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc].keys).to match_array %i[en fr-BE nl-BE]
        expect(json_attributes[:ui_schema_multiloc].keys).to match_array %i[en fr-BE nl-BE]
        visible_built_in_field_keys = %i[
          title_multiloc
          body_multiloc
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]
        %i[en fr-BE nl-BE].each do |locale|
          expect(json_attributes[:json_schema_multiloc][locale][:properties].keys).to match_array(visible_built_in_field_keys + [custom_field.key.to_sym])
        end
        ui_schema = json_attributes[:ui_schema_multiloc][:en]
        expect(ui_schema.keys).to match_array %i[type options elements]
        expect(ui_schema[:type]).to eq 'Categorization'
        expect(ui_schema[:options]).to eq({ formId: 'idea-form', inputTerm: 'question' })
        expect(ui_schema[:elements].size).to eq 3
      end
    end
  end

  describe 'in an active native survey phase with form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }
    let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc].keys).to match_array %i[en fr-BE nl-BE]
        %i[en fr-BE nl-BE].each do |locale|
          expect(json_attributes[:json_schema_multiloc][locale][:properties].keys).to match_array([custom_field.key.to_sym])
        end
        expect(json_attributes[:ui_schema_multiloc].keys).to match_array %i[en fr-BE nl-BE]
      end
    end
  end

  describe 'in an active phase without form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 200
        expect(json_parse(response_body)).to eq({ data: { type: 'json_forms_schema', attributes: nil } })
      end
    end
  end

  describe 'with an unknown phase id' do
    let(:phase_id) { 'unknown' }

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        assert_status 404
      end
    end
  end
end
