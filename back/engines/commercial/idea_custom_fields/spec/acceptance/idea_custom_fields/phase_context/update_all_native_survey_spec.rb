# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/admin/phases/:phase_id/custom_fields/update_all' do
    parameter :custom_fields, type: :array
    with_options scope: 'custom_fields[]' do
      parameter :id, 'The ID of an existing custom field to update. When the ID is not provided, a new field is created.', required: false
      parameter :input_type, 'The type of the input. Required when creating a new field.', required: false
      parameter :required, 'Whether filling out the field is mandatory', required: false
      parameter :enabled, 'Whether the field is active or not', required: false
      parameter :title_multiloc, 'A title of the field, as shown to users, in multiple locales', required: false
      parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
      parameter :options, type: :array
      parameter :logic, 'The logic JSON for the field'
    end
    with_options scope: 'options[]' do
      parameter :id, 'The ID of an existing custom field option to update. When the ID is not provided, a new option is created.', required: false
      parameter :title_multiloc, 'A title of the option, as shown to users, in multiple locales', required: false
    end

    let(:context) { create(:phase, participation_method: 'native_survey') }
    let(:custom_form) { create(:custom_form, participation_context: context) }
    let(:phase_id) { context.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Insert one field, update one field, and destroy one field' do
        field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
        create(:custom_field, resource: custom_form) # field to destroy
        request = {
          custom_fields: [
            { input_type: 'page' },
            # Inserted field first to test reordering of fields.
            {
              input_type: 'text',
              title_multiloc: { 'en' => 'Inserted field' },
              required: false,
              enabled: false
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'Updated field' },
              required: true,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            enabled: false,
            input_type: 'text',
            key: 'inserted_field',
            ordering: 1,
            required: false,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Which councils are you attending in our city?' },
            enabled: true,
            input_type: 'text',
            key: field_to_update.key,
            ordering: 2,
            required: true,
            title_multiloc: { en: 'Updated field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
      end

      example 'Destroy all fields' do
        create(:custom_field, resource: custom_form) # field to destroy
        request = { custom_fields: [] }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
      end

      example 'Add a custom field with options and delete a field with options' do
        delete_field = create(:custom_field_select, :with_options, resource: custom_form)
        delete_options = delete_field.options

        request = {
          custom_fields: [
            { input_type: 'page' },
            {
              input_type: 'multiselect',
              title_multiloc: { en: 'Inserted field' },
              required: false,
              maximum_select_count: 2,
              minimum_select_count: 1,
              select_count_enabled: false,
              enabled: true,
              options: [
                {
                  title_multiloc: { en: 'Option 1' }
                },
                {
                  title_multiloc: { en: 'Option 2' }
                }
              ]
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse response_body

        expect(CustomField.where(id: delete_field).count).to eq 0
        expect(CustomFieldOption.where(id: delete_options).count).to eq 0
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            enabled: true,
            input_type: 'multiselect',
            key: 'inserted_field',
            ordering: 1,
            required: false,
            maximum_select_count: 2,
            minimum_select_count: 1,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: {
            options: {
              data: [
                {
                  id: an_instance_of(String),
                  type: 'custom_field_option'
                },
                {
                  id: an_instance_of(String),
                  type: 'custom_field_option'
                }
              ]
            }
          }
        })
        options = CustomField.find(json_response.dig(:data, 1, :id)).options
        json_option1 = json_response[:included].find do |json_option|
          json_option[:id] == options.first.id
        end
        json_option2 = json_response[:included].find do |json_option|
          json_option[:id] == options.last.id
        end
        expect(json_option1).to match({
          id: options.first.id,
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Option 1' },
            ordering: 0,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          }
        })
        expect(json_option2).to match({
          id: options.last.id,
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Option 2' },
            ordering: 1,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          }
        })
      end

      example 'Remove all custom fields' do
        create_list(:custom_field_select, 2, :with_options, resource: custom_form)

        do_request custom_fields: []

        assert_status 200
        json_response = json_parse response_body

        expect(CustomField.where(resource: custom_form).count).to eq 0
        expect(CustomFieldOption.where(custom_field: CustomField.where(resource: custom_form)).count).to eq 0
        expect(json_response[:data].size).to eq 0
      end

      example 'Remove all options of a custom field' do
        field = create(:custom_field_select, :with_options, resource: custom_form)

        request = {
          custom_fields: [
            { input_type: 'page' },
            {
              id: field.id,
              title_multiloc: { 'en' => 'Updated field' },
              required: true,
              enabled: true,
              options: []
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse response_body

        expect(CustomField.where(id: field).count).to eq 1
        expect(field.reload.options.count).to eq 0
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: an_instance_of(Hash),
            enabled: true,
            input_type: 'select',
            key: field.key,
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Updated field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
      end

      example '[error] Updating custom fields in a native survey phase when there are responses' do
        IdeaStatus.create_defaults
        create(:idea, project: context.project, creation_phase: context, phases: [context])

        do_request(custom_fields: [])

        assert_status 401
        expect(json_response_body).to eq({ error: 'updating_form_with_input' })
      end

      example 'Updating custom fields in a native survey phase when there are no responses' do
        ideation_phase = create(:phase, participation_method: 'ideation', project: context.project, start_at: (context.start_at - 7.days), end_at: (context.start_at - 1.day))
        create(:idea, project: ideation_phase.project, phases: [ideation_phase])
        create(:idea, project: ideation_phase.project)

        do_request(custom_fields: [])

        assert_status 200
      end
    end
  end
end
