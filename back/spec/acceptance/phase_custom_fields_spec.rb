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

  describe 'in an ideation phase with form fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase_id) { project.phases.first.id }
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        built_in_field_keys = %i[
          title_multiloc
          body_multiloc
          author_id
          budget
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]
        if CitizenLab.ee?
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq(built_in_field_keys + [custom_field.key.to_sym])
          end
        else
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq built_in_field_keys
          end
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        visible_built_in_field_keys = %i[
          title_multiloc
          body_multiloc
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]
        if CitizenLab.ee?
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq(visible_built_in_field_keys + [custom_field.key.to_sym])
          end
        else
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq visible_built_in_field_keys
          end
        end
      end
    end
  end

  describe 'in an active phase with form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }
    let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
    let!(:custom_field) { create(:custom_field_extra_custom_form, resource: custom_form) }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response).to eq({
            json_schema_multiloc: {
              en: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  extra_field: {
                    title: 'An extra question',
                    description: 'Which councils are you attending in our city?',
                    type: 'string'
                  }
                }
              },
              'fr-FR': {
                type: 'object',
                additionalProperties: false,
                properties: {
                  extra_field: {
                    title: 'An extra question',
                    description: 'Which councils are you attending in our city?',
                    type: 'string'
                  }
                }
              },
              'nl-NL': {
                type: 'object',
                additionalProperties: false,
                properties: {
                  extra_field: {
                    title: 'An extra question',
                    description: 'Which councils are you attending in our city?',
                    type: 'string'
                  }
                }
              }
            },
            ui_schema_multiloc: {
              en: { extra_field: {}, 'ui:order': ['extra_field'] },
              'fr-FR': { extra_field: {}, 'ui:order': ['extra_field'] },
              'nl-NL': { extra_field: {}, 'ui:order': ['extra_field'] }
            }
          })
        else
          expect(json_response).to eq schemas_without_fields
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_response[:json_schema_multiloc][locale][:properties].keys).to eq([custom_field.key.to_sym])
          end
          expect(json_response[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
        else
          expect(json_response).to be_nil
        end
      end
    end
  end

  describe 'in an active phase without form fields' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase_id) { project.phases.first.id }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to eq schemas_without_fields
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to be_nil
      end
    end
  end

  describe 'with an unknown phase id' do
    let(:phase_id) { 'unknown' }

    get 'web_api/v1/phases/:phase_id/custom_fields/schema' do
      example_request 'Get the react-jsonschema-form json schema and ui schema for the custom fields' do
        expect(status).to eq 404
      end
    end

    get 'web_api/v1/phases/:phase_id/custom_fields/json_forms_schema' do
      example_request 'Get the jsonforms.io json schema and ui schema for the custom fields' do
        expect(status).to eq 404
      end
    end
  end
end
