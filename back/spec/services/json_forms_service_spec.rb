# frozen_string_literal: true

require 'rails_helper'

describe JsonFormsService do
  let(:service) { described_class.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:locale) { 'en' }
  let(:user) { create(:user) }

  context 'registration fields' do
    describe 'fields_to_ui_schema_multiloc' do
      let(:title_multiloc) { { 'en' => 'size', 'nl-NL' => 'grootte' } }
      let(:description_multiloc) { { 'en' => 'How big is it?', 'nl-NL' => 'Hoe groot is het?' } }
      let(:fields) do
        [

          create(:custom_field,
            key: 'field1',
            input_type: 'text',
            title_multiloc: title_multiloc,
            description_multiloc: description_multiloc)
        ]
      end

      it 'creates localized schemas with titles and descriptions for all languages' do
        ui_schema = service.user_ui_and_json_multiloc_schemas(fields)[:ui_schema_multiloc]
        expect(ui_schema['en'][:elements][0][:label]).to eq title_multiloc['en']
        expect(ui_schema['nl-NL'][:elements][0][:label]).to eq title_multiloc['nl-NL']
        expect(ui_schema['en'][:elements][0][:options][:description]).to eq description_multiloc['en']
        expect(ui_schema['nl-NL'][:elements][0][:options][:description]).to eq description_multiloc['nl-NL']
      end
    end

    describe 'fields_to_json_schema_multiloc' do
      it 'returns nil when no fields are given' do
        schema = service.user_ui_and_json_multiloc_schemas([])
        expect(schema).to be_nil
      end

      it 'creates a valid schema with all input types' do
        fields = [
          create(:custom_field, key: 'field1', input_type: 'text'),
          create(:custom_field, key: 'field2', input_type: 'multiline_text', required: true),
          create(:custom_field, key: 'field3', input_type: 'select'),
          create(:custom_field, key: 'field4', input_type: 'multiselect'),
          create(:custom_field, key: 'field5', input_type: 'checkbox'),
          create(:custom_field, key: 'field6', input_type: 'date', enabled: false, required: true),
          create(:custom_field, key: 'field7', input_type: 'number'),
          create(:custom_field, key: 'field8', input_type: 'multiselect', required: true),
          create(:custom_field, key: 'field9', input_type: 'files', required: true)
        ]
        create(:custom_field_option, key: 'option_1', custom_field: fields[2], ordering: 1)
        create(:custom_field_option, key: 'option_3', custom_field: fields[2], ordering: 3)
        create(:custom_field_option, key: 'option_2', custom_field: fields[2], ordering: 2)
        create(:custom_field_option, key: 'option_a', custom_field: fields[3], ordering: 1)
        create(:custom_field_option, key: 'option_b', custom_field: fields[3], ordering: 2)
        create(:custom_field_option, key: 'option_a', custom_field: fields[7], ordering: 1)
        create(:custom_field_option, key: 'option_b', custom_field: fields[7], ordering: 2)

        schema = service.user_ui_and_json_multiloc_schemas(fields)[:json_schema_multiloc]['en']
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema).to match(
          { type: 'object',
            additionalProperties: false,
            properties: { 'field1' =>
              { type: 'string' },
                          'field2' =>
            { type: 'string' },
                          'field3' =>
              {
                type: 'string',
                oneOf: [
                  {
                    const: 'option_1',
                    title: 'youth council'
                  },
                  {
                    const: 'option_2',
                    title: 'youth council'
                  },
                  {
                    const: 'option_3',
                    title: 'youth council'
                  }
                ]
              },
                          'field4' =>
              {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: { type: 'string',
                         oneOf: [
                           {
                             const: 'option_a',
                             title: 'youth council'
                           },
                           {
                             const: 'option_b',
                             title: 'youth council'
                           }
                         ] }
              },
                          'field5' =>
              { type: 'boolean' },
                          # field6 is excluded because it is disabled.
                          'field7' =>
              { type: 'number' },
                          'field8' =>
              { type: 'array',
                uniqueItems: true,
                minItems: 1,
                items: { type: 'string',
                         oneOf: [
                           {
                             const: 'option_a',
                             title: 'youth council'
                           },
                           {
                             const: 'option_b',
                             title: 'youth council'
                           }
                         ] } },
                          'field9' =>
              { type: 'array',
                items: { properties: { file_by_content: { properties: { file: { type: 'string' },
                                                                        name: { type: 'string' } },
                                                          type: 'object' },
                                       name: { type: 'string' } },
                         type: 'object' } } },
            required: %w[field2 field8 field9] }
        )
      end
    end

    describe 'fields_to_ui_schema' do
      it 'creates a valid ui schema with all input types' do
        fields = [
          create(:custom_field, key: 'field1', input_type: 'text'),
          create(:custom_field, key: 'field2', input_type: 'multiline_text', required: true),
          create(:custom_field, key: 'field3', input_type: 'select'),
          create(:custom_field, key: 'field4', input_type: 'multiselect'),
          create(:custom_field, key: 'field5', input_type: 'checkbox'),
          create(:custom_field, key: 'field6', input_type: 'date'),
          create(:custom_field, key: 'field7', input_type: 'multiline_text', enabled: false, required: true),
          create(:custom_field, key: 'field8', input_type: 'text', hidden: true, enabled: true)
        ]
        create(:custom_field_option, key: 'option1', custom_field: fields[2])
        create(:custom_field_option, key: 'option2', custom_field: fields[2])
        create(:custom_field_option, key: 'option3', custom_field: fields[3])
        create(:custom_field_option, key: 'option4', custom_field: fields[3])

        ui_schema = service.user_ui_and_json_multiloc_schemas(fields.map(&:reload))[:ui_schema_multiloc]['en']
        expect(ui_schema[:type]).to be_present
        expect(ui_schema[:options]).to be_present
        expect(ui_schema[:elements]).to match([
          {
            type: 'Control',
            scope: '#/properties/field1',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?',
              transform: 'trim_on_blur'
            }
          },
          {
            type: 'Control',
            scope: '#/properties/field2',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?',
              textarea: true,
              transform: 'trim_on_blur'
            }
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field3'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field4'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field5'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field6'
          }
        ])
      end
    end
  end

  context 'idea form fields' do
    describe 'input_ui_and_json_multiloc_schemas' do
      it 'generates expected output for different kinds of fields' do
        config = AppConfiguration.instance
        config.settings['core']['locales'] = ['en']
        config.save!

        project = create :project
        form = create :custom_form, participation_context: project
        required_field = create :custom_field, :for_custom_form, resource: form, required: true, input_type: 'number'
        optional_field = create :custom_field_select, :for_custom_form, resource: form, required: false
        create :custom_field_option, custom_field: optional_field, key: 'option1', title_multiloc: { 'en' => 'Rabbit' }
        create :custom_field_option, custom_field: optional_field, key: 'option2', title_multiloc: { 'en' => 'Bear' }
        build_in_required_field = create(
          :custom_field_multiselect,
          :for_custom_form,
          resource: form,
          required: true,
          key: 'topic_ids',
          code: 'topic_ids'
        )
        build_in_optional_field = create(
          :custom_field_multiselect,
          :for_custom_form,
          resource: form,
          required: false,
          key: 'idea_files_attributes',
          code: 'idea_files_attributes'
        )
        fields = [required_field, optional_field, build_in_required_field, build_in_optional_field]

        output = service.input_ui_and_json_multiloc_schemas fields, user
        expect(output).to include(
          {
            json_schema_multiloc: {
              'en' => {
                type: 'object',
                additionalProperties: false,
                properties: {
                  'topic_ids' => {
                    type: 'array',
                    uniqueItems: true,
                    minItems: 1,
                    items: { type: 'string' }
                  },
                  required_field.key => { type: 'number' },
                  optional_field.key => {
                    type: 'string',
                    oneOf: [
                      { const: 'option1', title: 'Rabbit' },
                      { const: 'option2', title: 'Bear' }
                    ]
                  },
                  'idea_files_attributes' => {
                    type: 'array',
                    uniqueItems: true,
                    minItems: 0,
                    items: { type: 'string' }
                  }
                },
                required: match_array(['topic_ids', required_field.key])
              }
            },
            ui_schema_multiloc: {
              'en' => {
                type: 'Categorization',
                options: { formId: 'idea-form', inputTerm: 'idea' },
                elements: [
                  {
                    type: 'Category',
                    options: { id: 'details' },
                    label: 'Details',
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/topic_ids',
                        label: build_in_required_field.title_multiloc['en'],
                        options: {
                          description: build_in_required_field.description_multiloc['en'],
                          isAdminField: false
                        }
                      }
                    ]
                  },
                  {
                    type: 'Category',
                    label: 'Images and attachments',
                    options: { id: 'attachments' },
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/idea_files_attributes',
                        label: build_in_optional_field.title_multiloc['en'],
                        options: {
                          description: build_in_optional_field.description_multiloc['en'],
                          isAdminField: false
                        }
                      }
                    ]
                  },
                  {
                    type: 'Category',
                    options: { id: 'extra' },
                    label: 'Additional information',
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{required_field.key}",
                        label: required_field.title_multiloc['en'],
                        options: {
                          description: required_field.description_multiloc['en'],
                          isAdminField: false
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{optional_field.key}",
                        label: optional_field.title_multiloc['en'],
                        options: {
                          description: optional_field.description_multiloc['en'],
                          isAdminField: false
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        )
      end
    end
  end
end
