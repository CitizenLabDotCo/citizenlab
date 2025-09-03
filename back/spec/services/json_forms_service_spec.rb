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
                enum: %w[option_1 option_2 option_3]
              },
                          'field4' =>
              {
                type: 'array',
                uniqueItems: true,
                maxItems: 2,
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
                maxItems: 2,
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
          create(:custom_field_ranking, :with_options, key: 'field7'),
          create(:custom_field_matrix_linear_scale, key: 'field8'),
          create(:custom_field, key: 'field9', input_type: 'multiline_text', enabled: false, required: true),
          create(:custom_field, key: 'field10', input_type: 'text', hidden: true, enabled: true)
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
              input_type: 'text',
              description: 'Which councils are you attending in our city?',
              transform: 'trim_on_blur'
            }
          },
          {
            type: 'Control',
            scope: '#/properties/field2',
            label: 'Did you attend',
            options: {
              input_type: 'multiline_text',
              description: 'Which councils are you attending in our city?',
              textarea: true,
              transform: 'trim_on_blur'
            }
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              input_type: 'select',
              description: 'Which councils are you attending in our city?',
              enumNames: ['youth council', 'youth council']
            },
            scope: '#/properties/field3'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              input_type: 'multiselect',
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field4'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              input_type: 'checkbox',
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field5'
          },
          {
            type: 'Control',
            label: 'Did you attend',
            options: {
              input_type: 'date',
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field6'
          },
          {
            type: 'Control',
            label: 'Rank your favourite means of public transport',
            options: {
              input_type: 'ranking',
              description: 'Which councils are you attending in our city?'
            },
            scope: '#/properties/field7'
          },
          {
            type: 'Control',
            scope: '#/properties/field8',
            label: 'Please indicate how strong you agree or disagree with the following statements.',
            options: {
              description: 'Which councils are you attending in our city?',
              input_type: 'matrix_linear_scale',
              statements: [
                { key: 'send_more_animals_to_space', label: 'We should send more animals into space' },
                { key: 'ride_bicycles_more_often', label: 'We should ride our bicycles more often' }
              ],
              linear_scale_label1: 'Strongly disagree',
              linear_scale_label2: '',
              linear_scale_label3: '',
              linear_scale_label4: '',
              linear_scale_label5: 'Strongly agree',
              linear_scale_label6: '',
              linear_scale_label7: '',
              linear_scale_label8: '',
              linear_scale_label9: '',
              linear_scale_label10: '',
              linear_scale_label11: ''
            }
          }
        ])
      end
    end
  end

  context 'idea form fields' do
    # TODO
    # - Hide author and budget when not admin (in JsonFormsService)
    # - Add author and budget when admin (in JsonFormsService)
    describe 'input_ui_and_json_multiloc_schemas' do
      let(:input_term) { 'question' }
      let(:project) { create(:single_phase_budgeting_project, phase_attrs: { input_term: input_term }) }
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      let!(:page) do
        create(
          :custom_field_page,
          :for_custom_form, resource: custom_form,
          title_multiloc: { 'en' => 'My page title' },
          description_multiloc: { 'en' => 'My page description' }
        )
      end
      let!(:required_field) do
        create(
          :custom_field,
          :for_custom_form, resource: custom_form,
          required: true,
          input_type: 'number',
          title_multiloc: { 'en' => 'My required field' }
        )
      end
      let!(:optional_field) do
        create(
          :custom_field_select,
          :for_custom_form, resource: custom_form,
          required: false,
          title_multiloc: { 'en' => 'My optional field' }
        ).tap do |field|
          create(:custom_field_option, custom_field: field, key: 'option1', title_multiloc: { 'en' => 'Rabbit' })
          create(:custom_field_option, custom_field: field, key: 'option2', title_multiloc: { 'en' => 'Bear' })
        end
      end
      let(:fields) { IdeaCustomFieldsService.new(custom_form).enabled_fields }
      let(:participation_method) { project.pmethod }
      let(:output) { service.input_ui_and_json_multiloc_schemas fields, user, participation_method, input_term }

      context 'when resident' do
        let(:user) { create(:user) }

        it 'generates expected output for different kinds of fields' do
          topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
          topic_field.update!(required: true)

          expect(output).to match(
            {
              json_schema_multiloc: hash_including(
                'en' => {
                  type: 'object',
                  additionalProperties: false,
                  properties: hash_including(
                    'topic_ids' => {
                      type: 'array',
                      uniqueItems: true,
                      minItems: 1,
                      items: { type: 'string' }
                    },
                    'idea_files_attributes' => {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          file_by_content: {
                            type: 'object',
                            properties: {
                              file: { type: 'string' },
                              name: { type: 'string' }
                            }
                          }
                        }
                      }
                    },
                    required_field.key => { type: 'number' },
                    optional_field.key => {
                      type: 'string',
                      enum: %w[option1 option2]
                    }
                  ),
                  required: match_array(['title_multiloc', 'body_multiloc', 'topic_ids', required_field.key])
                }
              ),
              ui_schema_multiloc: hash_including(
                'en' => {
                  type: 'Categorization',
                  options: { formId: 'idea-form', inputTerm: 'question' },
                  elements: array_including(
                    hash_including(
                      type: 'Page',
                      options: hash_including(title: 'What is your question?')
                    ),
                    hash_including(
                      type: 'Page',
                      options: hash_including(title: 'Images and attachments'),
                      elements: array_including(
                        hash_including(
                          type: 'Control',
                          scope: '#/properties/idea_images_attributes',
                          label: 'Images',
                          options: hash_including(input_type: 'image_files')
                        ),
                        hash_including(
                          type: 'Control',
                          scope: '#/properties/idea_files_attributes',
                          label: 'Attachments',
                          options: hash_including(input_type: 'files')
                        )
                      )
                    ),
                    hash_including(
                      type: 'Page',
                      options: hash_including(title: 'Details'),
                      elements: array_including(
                        hash_including(
                          type: 'Control',
                          scope: '#/properties/topic_ids',
                          label: 'Tags',
                          options: hash_including(input_type: 'topic_ids')
                        ),
                        hash_including(
                          type: 'Control',
                          scope: '#/properties/location_description',
                          label: 'Location',
                          options: hash_including(input_type: 'text')
                        )
                      )
                    ),
                    hash_including(
                      type: 'Page',
                      options: hash_including(title: 'My page title'),
                      elements: array_including(
                        hash_including(
                          type: 'Control',
                          scope: "#/properties/#{required_field.key}",
                          label: 'My required field',
                          options: hash_including(input_type: 'number')
                        ),
                        hash_including(
                          type: 'Control',
                          scope: "#/properties/#{optional_field.key}",
                          label: 'My optional field',
                          options: hash_including(input_type: 'select')
                        )
                      )
                    )
                  )
                }
              )
            }
          )
        end

        it 'does not include budget and author fields' do
          expect(output[:json_schema_multiloc]['en'][:properties]).not_to have_key 'author_id'
          expect(output[:json_schema_multiloc]['en'][:properties]).not_to have_key 'budget'

          expect(output.dig(:ui_schema_multiloc, 'en', :elements, 0, :elements, 0, :scope)).not_to eq '#/properties/author_id'
          expect(output.dig(:ui_schema_multiloc, 'en', :elements, 2, :elements, 0, :scope)).not_to eq '#/properties/budget'
        end

        it 'renders text images for fields' do
          description_multiloc = {
            'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
          }
          field = create(:custom_field, :for_custom_form, input_type: 'text', description_multiloc: description_multiloc)
          allow_any_instance_of(TextImageService).to(
            receive(:render_data_images_multiloc).with(field.description_multiloc, field: :description_multiloc, imageable: field).and_return({ 'en' => 'Description with text images' })
          )

          ui_schema = service.input_ui_and_json_multiloc_schemas([field], nil, participation_method, 'option')[:ui_schema_multiloc]
          expect(ui_schema.dig('en', :elements, 0, :elements, 0, :options, :description)).to eq 'Description with text images'
        end

        it 'renders text images for pages' do
          description_multiloc = {
            'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
          }
          field = create(:custom_field_page, :for_custom_form, description_multiloc: description_multiloc)
          allow_any_instance_of(TextImageService).to(
            receive(:render_data_images_multiloc).with(field.description_multiloc, field: :description_multiloc, imageable: field).and_return({ 'en' => 'Description with text images' })
          )

          ui_schema = service.input_ui_and_json_multiloc_schemas([field], nil, participation_method, 'question')[:ui_schema_multiloc]
          expect(ui_schema.dig('en', :elements, 0, :options, :description)).to eq 'Description with text images'
        end
      end

      context 'when admin' do
        before { SettingsService.new.activate_feature! 'idea_author_change' }

        let(:user) { create(:admin) }

        it 'includes budget and author fields' do
          expect(output[:json_schema_multiloc]['en'][:properties]['author_id']).to eq({ type: 'string' })
          expect(output[:json_schema_multiloc]['en'][:properties]['budget']).to eq({ type: 'number' })

          expect(output[:ui_schema_multiloc]['en'][:elements][0][:elements][0]).to eq({
            type: 'Control',
            scope: '#/properties/author_id',
            label: 'Author',
            options: {
              answer_visible_to: 'public',
              input_type: 'text',
              transform: 'trim_on_blur',
              isAdminField: true,
              hasRule: false,
              description: ''
            }
          })
          expect(output[:ui_schema_multiloc]['en'][:elements][3][:elements][0]).to eq({
            type: 'Control',
            scope: '#/properties/budget',
            label: 'Budget',
            options: {
              answer_visible_to: 'public',
              input_type: 'number',
              isAdminField: true,
              hasRule: false,
              description: ''
            }
          })
        end

        it 'includes the budget field on top of the proposed budget field when there is no details page but there is a proposed budget field' do
          custom_form.custom_fields.find { |field| field.code == 'details_page' }.destroy!
          custom_form.custom_fields.find { |field| field.code == 'proposed_budget' }.update!(enabled: true)
          custom_form.reload

          expect(output[:json_schema_multiloc]['en'][:properties]['budget']).to eq({ type: 'number' })
          expect(output[:ui_schema_multiloc]['en'][:elements][2][:elements][4][:scope]).to eq '#/properties/budget'
          expect(output[:ui_schema_multiloc]['en'][:elements][2][:elements][5][:scope]).to eq '#/properties/proposed_budget'
        end

        it 'includes the budget field under the body multiloc field when there is no details page and no proposed budget field' do
          custom_form.custom_fields.find { |field| field.code == 'details_page' }.destroy!
          custom_form.custom_fields.find { |field| field.code == 'proposed_budget' }.update!(enabled: false)
          custom_form.reload

          expect(output[:json_schema_multiloc]['en'][:properties]['budget']).to eq({ type: 'number' })
          expect(output[:ui_schema_multiloc]['en'][:elements][1][:elements][0][:options]).to include({ input_type: 'html_multiloc', render: 'multiloc' }) # body_multiloc
          expect(output[:ui_schema_multiloc]['en'][:elements][1][:elements][1][:scope]).to eq '#/properties/budget'
        end
      end
    end
  end
end
