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
      parameter :image_id, 'If the option has an image, the ID of the image', required: false
    end

    let(:context) { create(:native_survey_phase) }
    let(:custom_form) { create(:custom_form, participation_context: context) }
    let(:phase_id) { context.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Insert one field, update one field, and destroy one field' do
        field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
        create(:custom_field, resource: custom_form) # field to destroy
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
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
            key: Regexp.new('inserted_field'),
            ordering: 1,
            required: false,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
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
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
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

      example 'Add a custom field with options, including an "other" option and delete a field with options' do
        delete_field = create(:custom_field_select, :with_options, resource: custom_form)
        delete_options = delete_field.options

        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              input_type: 'multiselect',
              title_multiloc: { en: 'Inserted field' },
              required: false,
              enabled: true,
              options: [
                {
                  title_multiloc: { en: 'Option 1' }
                },
                {
                  title_multiloc: { en: 'Other' },
                  other: true
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
            dropdown_layout: false,
            enabled: true,
            input_type: 'multiselect',
            key: Regexp.new('inserted_field'),
            ordering: 1,
            required: false,
            select_count_enabled: false,
            maximum_select_count: nil,
            minimum_select_count: nil,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
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
            },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
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
            other: false,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          },
          relationships: { image: { data: nil } }
        })
        expect(json_option2).to match({
          id: options.last.id,
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Other' },
            ordering: 1,
            other: true,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          },
          relationships: { image: { data: nil } }
        })
      end

      example 'Add a custom field with image options' do
        image1 = create(:custom_field_option_image, custom_field_option: nil)
        image2 = create(:custom_field_option_image, custom_field_option: nil)
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              input_type: 'multiselect_image',
              title_multiloc: { en: 'Inserted field' },
              required: false,
              enabled: true,
              options: [
                {
                  title_multiloc: { en: 'Option 1' },
                  image_id: image1.id
                },
                {
                  title_multiloc: { en: 'Option 2' },
                  image_id: image2.id
                }
              ]
            }
          ]
        }
        do_request request

        assert_status 200

        expect(CustomField.all.count).to eq 2
        expect(CustomFieldOption.all.count).to eq 2
        expect(CustomFieldOption.all.map { |c| c.image.id }).to match [image1.id, image2.id]
        expect(response_data[1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            enabled: true,
            input_type: 'multiselect_image',
            key: Regexp.new('inserted_field'),
            ordering: 1,
            required: false,
            select_count_enabled: false,
            maximum_select_count: nil,
            minimum_select_count: nil,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
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
            },
            resource: { data: { id: CustomForm.first.id, type: 'custom_form' } }
          }
        })
        expect(json_response_body[:included].pluck(:type)).to match_array(
          %w[image custom_field_option image custom_field_option custom_form]
        )
      end

      example '[error] Add a field of unsupported input_type' do
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              input_type: 'topic_ids',
              title_multiloc: { 'en' => 'Topics field title' },
              description_multiloc: { 'en' => 'Topics field description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to eq({ errors: { '1': { input_type: [{ error: 'inclusion', value: 'topic_ids' }] } } })
      end

      example '[error] form_last_updated_at provided is before the date the form was last updated (ie this has been updated by another user/tab)' do
        custom_form.save!
        request = {
          form_last_updated_at: DateTime.now - 1.day,
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            }
          ]
        }
        do_request request

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to eq({ :errors => { :form => [{ :error => 'stale_data' }] } })
      end

      example 'Update linear_scale field' do
        field_to_update = create(:custom_field_linear_scale, resource: custom_form)
        create(:custom_field, resource: custom_form) # field to destroy
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'Select a value from the scale' },
              description_multiloc: { 'en' => 'Description of question' },
              required: true,
              enabled: true,
              maximum: 7,
              linear_scale_label_1_multiloc: { 'en' => 'Lowest' },
              linear_scale_label_2_multiloc: { 'en' => 'Low' },
              linear_scale_label_3_multiloc: { 'en' => 'Low-ish' },
              linear_scale_label_4_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_5_multiloc: { 'en' => 'High-ish' },
              linear_scale_label_6_multiloc: { 'en' => 'High' },
              linear_scale_label_7_multiloc: { 'en' => 'Highest' }
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Description of question' },
            enabled: true,
            input_type: 'linear_scale',
            key: an_instance_of(String),
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Select a value from the scale' },
            updated_at: an_instance_of(String),
            maximum: 7,
            linear_scale_label_1_multiloc: { en: 'Lowest' },
            linear_scale_label_2_multiloc: { en: 'Low' },
            linear_scale_label_3_multiloc: { en: 'Low-ish' },
            linear_scale_label_4_multiloc: { en: 'Neutral' },
            linear_scale_label_5_multiloc: { en: 'High-ish' },
            linear_scale_label_6_multiloc: { en: 'High' },
            linear_scale_label_7_multiloc: { en: 'Highest' },
            logic: {},
            random_option_ordering: false,
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      context 'Update custom field options with images' do
        let!(:page) { create(:custom_field_page, resource: custom_form) }
        let!(:field) { create(:custom_field_multiselect_image, resource: custom_form) }
        let!(:option1) { create(:custom_field_option, key: 'option1', custom_field: field) }
        let!(:option2) { create(:custom_field_option, key: 'option2', custom_field: field) }
        let!(:image1) { create(:custom_field_option_image, custom_field_option: option1) }
        let!(:image2) { create(:custom_field_option_image, custom_field_option: option2) }

        example 'Remove an image from a custom field option' do
          request = {
            custom_fields: [
              {
                id: page.id,
                input_type: 'page',
                page_layout: 'default'
              },
              {
                id: field.id,
                input_type: 'multiselect',
                title_multiloc: { en: 'Inserted field' },
                required: false,
                enabled: true,
                options: [
                  {
                    id: option1.id,
                    title_multiloc: { en: 'Option 1' },
                    image_id: ''
                  },
                  {
                    id: option2.id,
                    title_multiloc: { en: 'Option 2' }
                  }
                ]
              }
            ]
          }
          do_request request

          assert_status 200
          expect(CustomFieldOptionImage.all.count).to eq 1
          expect(CustomFieldOption.find(option1.id).image).to be_nil
          expect(json_response_body[:included].pluck(:type)).to match_array(
            %w[image custom_field_option custom_field_option custom_form]
          )
        end

        example 'Update an image on a custom field option' do
          new_image = create(:custom_field_option_image, custom_field_option: nil)
          request = {
            custom_fields: [
              {
                id: page.id,
                input_type: 'page',
                page_layout: 'default'
              },
              {
                id: field.id,
                input_type: 'multiselect',
                title_multiloc: { en: 'Inserted field' },
                required: false,
                enabled: true,
                options: [
                  {
                    id: option1.id,
                    title_multiloc: { en: 'Option 1' },
                    image_id: new_image.id
                  },
                  {
                    id: option2.id,
                    title_multiloc: { en: 'Option 2' }
                  }
                ]
              }
            ]
          }

          expect(CustomFieldOptionImage.all.count).to eq 3
          do_request request

          assert_status 200
          expect(CustomFieldOptionImage.all.count).to eq 2
          expect(CustomFieldOption.find(option1.id).image.id).to eq new_image.id
          expect(CustomFieldOptionImage.pluck(:custom_field_option_id)).to match_array(
            [new_image.reload.custom_field_option_id, image2.custom_field_option_id]
          )
          expect(json_response_body[:included].pluck(:type)).to match_array(
            %w[image custom_field_option image custom_field_option custom_form]
          )
        end
      end

      example 'Update a custom field with options, when it has been removed in another request (another tab)' do
        select_field = create(:custom_field_select, resource: custom_form, key: 'update_field_xyz')
        option1 = create(:custom_field_option, custom_field: select_field, key: 'option_1_xyz')
        option2 = create(:custom_field_option, custom_field: select_field, key: 'option_2_xyz')

        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: select_field.id,
              input_type: 'multiselect',
              key: 'update_field_xyz',
              title_multiloc: { en: 'Updated field' },
              required: false,
              enabled: true,
              options: [
                {
                  id: option1.id,
                  key: 'option_1_xyz',
                  title_multiloc: { en: 'Updated option 1' }
                },
                {
                  id: option2.id,
                  key: 'option_2_xyz',
                  title_multiloc: { en: 'Updated option 2' }
                }
              ]
            }
          ]
        }

        # Original fields have been deleted
        select_field.destroy!
        expect { select_field.reload }.to raise_error ActiveRecord::RecordNotFound
        expect { option1.reload }.to raise_error ActiveRecord::RecordNotFound
        expect { option2.reload }.to raise_error ActiveRecord::RecordNotFound

        do_request request

        assert_status 200

        # Fields and options have been recreated as new fields with the same IDs and keys
        new_select_field = CustomField.find(select_field.id)
        expect(new_select_field.id).to eq select_field.id
        expect(new_select_field.key).to eq select_field.key
        expect(new_select_field.title_multiloc).to eq({ 'en' => 'Updated field' })

        new_option1 = CustomFieldOption.find(option1.id)
        expect(new_option1.id).to eq option1.id
        expect(new_option1.key).to eq option1.key
        expect(new_option1.title_multiloc).to eq({ 'en' => 'Updated option 1' })

        new_option2 = CustomFieldOption.find(option2.id)
        expect(new_option2.id).to eq option2.id
        expect(new_option2.key).to eq option2.key
        expect(new_option2.title_multiloc).to eq({ 'en' => 'Updated option 2' })
      end

      example 'Duplicate an option image when a new option is given an image_id already in use' do
        select_field = create(:custom_field_select, resource: custom_form)
        option = create(:custom_field_option, custom_field: select_field)
        option_image = create(:custom_field_option_image, custom_field_option: option)

        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: select_field.id,
              input_type: select_field.input_type,
              title_multiloc: select_field.title_multiloc,
              options: [
                {
                  id: option.id,
                  title_multiloc: option.title_multiloc,
                  image_id: option_image.id
                }
              ]
            },
            {
              input_type: 'select',
              title_multiloc: { en: 'New field' },
              required: false,
              enabled: true,
              options: [
                {
                  temp_id: SecureRandom.uuid,
                  title_multiloc: { en: 'New option' },
                  image_id: option_image.id
                }
              ]
            }
          ]
        }

        expect(CustomFieldOption.all.count).to eq 1
        expect(CustomFieldOptionImage.all.count).to eq 1

        do_request request

        assert_status 200
        expect(CustomFieldOption.all.count).to eq 2
        expect(CustomFieldOptionImage.all.count).to eq 2
        expect(FileUtils.compare_file(
          CustomFieldOptionImage.first.image.file.file, CustomFieldOptionImage.last.image.file.file
        )).to be_truthy
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
            {
              input_type: 'page',
              page_layout: 'default'
            },
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
            dropdown_layout: false,
            enabled: true,
            input_type: 'select',
            key: field.key,
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Updated field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Updating custom fields in a native survey phase when there are responses' do
        create(:idea_status_proposed)
        create(:custom_field, resource: custom_form) # field to ensure custom form has been created
        create(:idea, project: context.project, creation_phase: context, phases: [context])

        do_request(custom_fields: [])

        assert_status 200
        expect(json_response_body).to eq({
          data: [],
          included: []
        })
      end

      example 'Updating custom fields in a native survey phase when there are no responses' do
        ideation_phase = create(:phase, participation_method: 'ideation', project: context.project, start_at: (context.start_at - 7.days), end_at: (context.start_at - 1.day))
        create(:idea, project: ideation_phase.project, phases: [ideation_phase])
        create(:idea, project: ideation_phase.project)

        do_request(custom_fields: [])

        assert_status 200
      end

      context 'when CustomForm custom field has same key as User custom_field' do
        example 'Deleting the CustomForm field does not cause deletion User custom_field_values key', document: false do
          custom_field = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
          user1 = create(:user, custom_field_values: { custom_field.key => 'some value' })

          do_request({ custom_fields: [] })

          assert_status 200
          expect(user1.reload.custom_field_values).to eq({ custom_field.key => 'some value' })
        end
      end

      context 'when CustomForm custom field option collides with User custom field option' do
        example 'Deleting the CustomForm option does not delete the User custom_field_values value', document: false do
          field_to_update = create(:custom_field, input_type: 'select', resource: custom_form)
          option = create(:custom_field_option, custom_field: field_to_update)
          user1 = create(:user, custom_field_values: { field_to_update.key => option.key })

          request = {
            custom_fields: [
              {
                input_type: 'page',
                page_layout: 'default'
              },
              {
                id: field_to_update.id,
                options: []
              }
            ]
          }

          do_request request

          assert_status 200
          expect(user1.reload.custom_field_values).to eq({ field_to_update.key => option.key })
        end
      end

      example '[error] Invalid data in fields' do
        field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              # input_type is not given
              title_multiloc: { 'en' => 'Inserted field' },
              required: false,
              enabled: false
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => '' },
              required: true,
              enabled: true
            },
            {
              input_type: 'select',
              title_multiloc: { 'en' => 'Inserted field' },
              required: false,
              enabled: false,
              options: [
                {
                  title_multiloc: { 'en' => '' },
                  key: 'cat'
                }
              ],
              logic: {
                rules: [
                  {
                    if: 'cat',
                    then: [
                      {
                        effect: 'show'
                        # Missing goto_page_id
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
        do_request request

        assert_status 422
        json_response = json_parse(response_body)
        expect(json_response[:errors]).to eq({
          '1': {
            input_type: [
              { error: 'inclusion', value: nil }
            ]
          },
          '2': {
            title_multiloc: [{ error: 'blank' }]
          },
          '3': {
            options: {
              '0': {
                title_multiloc: [{ error: 'blank' }]
              }
            }
            # Logic errors are not included
          }
        })
      end

      example '[error] Invalid logic' do
        field_to_update = create(:custom_field_select, :with_options, resource: custom_form)
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'New title' },
              required: true,
              enabled: true,
              logic: {
                rules: [
                  {
                    if: field_to_update.options.first.id,
                    then: [
                      {
                        effect: 'show'
                        # Missing goto_page_id
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
        do_request request

        assert_status 422
        json_response = json_parse(response_body)
        expect(json_response[:errors]).to eq({
          '0': {},
          '1': {
            logic: [
              { error: 'invalid_structure' }
            ]
          }
        })
      end

      example '[error] logic on non-required field' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'New title' },
              required: false,
              enabled: true,
              logic: { rules: [{ if: 1, goto_page_id: page2.id }] }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 422
        json_response = json_parse(response_body)
        expect(json_response[:errors]).to eq({
          '0': {},
          '1': {
            logic: [
              { error: 'only_allowed_on_required_fields' }
            ]
          },
          '2': {}
        })
      end

      example 'Replace logic of a field' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        field_to_update.update!(logic: { rules: [{ if: 1, goto_page_id: page2.id }] })
        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [{ if: 2, goto_page_id: page3.id }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: page3.id }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Replace logic of a page' do
        page_to_update = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        page4 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 4' }, description_multiloc: { 'en' => 'Page 4 description' })
        page_to_update.update!(logic: { next_page_id: page3.id })
        request = {
          custom_fields: [
            {
              id: page_to_update.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: { next_page_id: page4.id }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page4.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page4.title_multiloc,
              description_multiloc: page4.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            page_layout: 'default',
            key: page_to_update.key,
            ordering: 0,
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: { next_page_id: page4.id },
            constraints: {},
            random_option_ordering: false
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 1,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page4.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page4.key,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: page4.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page4.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Update page logic referring to a new page' do
        page_to_update = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        page_to_update.update!(logic: { next_page_id: page3.id })
        request = {
          custom_fields: [
            {
              id: page_to_update.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: { next_page_id: 'TEMP-ID-1' },
              constraints: {},
              random_option_ordering: false
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 4' },
              description_multiloc: { 'en' => 'Page 4 description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page_to_update.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: { next_page_id: json_response[:data][3][:id] },
            constraints: {},
            random_option_ordering: false
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 1,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 4 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 4' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add a page with logic referring to a new page' do
        existing_page = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        request = {
          custom_fields: [
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'New page with logic' },
              description_multiloc: { 'en' => 'New page with logic description' },
              required: false,
              enabled: true,
              logic: { next_page_id: 'TEMP-ID-2' }
            },
            {
              id: existing_page.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: existing_page.title_multiloc,
              description_multiloc: existing_page.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-2',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Target page' },
              description_multiloc: { 'en' => 'Target page description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'New page with logic description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'New page with logic' },
            updated_at: an_instance_of(String),
            logic: { next_page_id: json_response[:data][2][:id] },
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: existing_page.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: existing_page.key,
            ordering: 1,
            page_layout: 'default',
            required: false,
            title_multiloc: existing_page.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: existing_page.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Target page description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Target page' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Remove logic from a page' do
        page_to_update = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        page_to_update.update!(logic: { next_page_id: page3.id })
        request = {
          custom_fields: [
            {
              id: page_to_update.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page_to_update.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 1,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Delete page logic referring to a deleted page' do
        page_to_update = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        page_to_update.update!(logic: { next_page_id: page3.id })
        request = {
          custom_fields: [
            {
              id: page_to_update.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page_to_update.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 1,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Update logic referring to a new page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        field_to_update.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          }
        )
        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 3' },
              description_multiloc: { 'en' => 'Page 3 description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][3][:id] }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 3 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 3' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Reorder a page with logic' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        field_to_update.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          }
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [{ if: 1, goto_page_id: page2.id }]
              }
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 1, goto_page_id: page2.id }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Remove logic from a field' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        field_to_update.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          }
        )
        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: false,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: false,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Delete logic referring to a deleted page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        field_to_update.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          }
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: false,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {}
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: false,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Delete field with logic referring to a deleted page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_delete = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        field_to_delete.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          }
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Delete one rule of field logic with multiple rules' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        field_to_update.update!(
          logic: {
            rules: [
              [{ if: 1, goto_page_id: page2.id }],
              [{ if: 2, goto_page_id: page3.id }]
            ]
          },
          required: true
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [{ if: 2, goto_page_id: page3.id }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: page3.id }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add logic referring to a new page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' },
          logic: {}
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 2' },
              description_multiloc: { 'en' => 'Page 2 description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][2][:id] }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 2 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add logic referring to a new option and a new page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field1_to_update = create(
          :custom_field_select,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' },
          logic: {}
        )
        field2_to_update = create(
          :custom_field_select,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 2 on page 1' },
          logic: {}
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field1_to_update.id,
              input_type: 'select',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              options: [
                {
                  title_multiloc: { 'en' => 'New option' },
                  temp_id: 'TEMP-ID-2'
                }
              ],
              logic: {
                rules: [
                  { if: 'TEMP-ID-2', goto_page_id: 'TEMP-ID-1' },
                  { if: 'TEMP-ID-NON-EXISTENT', goto_page_id: 'TEMP-ID-3' }
                ]
              }
            },
            {
              id: field2_to_update.id,
              input_type: 'select',
              title_multiloc: { 'en' => 'Question 2 on page 1' },
              required: true,
              enabled: true,
              options: [
                {
                  title_multiloc: { 'en' => 'New option' },
                  temp_id: 'TEMP-ID-4'
                }
              ],
              logic: {
                rules: [{ if: 'TEMP-ID-4', goto_page_id: 'TEMP-ID-3' }]
              }
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 2' },
              description_multiloc: { 'en' => 'Page 2 description' },
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-3',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 3' },
              description_multiloc: { 'en' => 'Page 3 description' },
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        expect(CustomFieldOption.count).to eq 2
        added_option1 = CustomFieldOption.find_by custom_field: field1_to_update
        added_option2 = CustomFieldOption.find_by custom_field: field2_to_update
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field1_to_update.description_multiloc.symbolize_keys,
            dropdown_layout: false,
            enabled: true,
            input_type: 'select',
            key: field1_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field1_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {
              rules: [{ if: added_option1.id, goto_page_id: json_response[:data][3][:id] }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field1_to_update.id,
          type: 'custom_field',
          relationships: {
            options: { data: [
              {
                id: added_option1.id,
                type: 'custom_field_option'
              }
            ] },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
          }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field2_to_update.description_multiloc.symbolize_keys,
            dropdown_layout: false,
            enabled: true,
            input_type: 'select',
            key: field2_to_update.key,
            ordering: 2,
            required: true,
            title_multiloc: field2_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {
              rules: [{ if: added_option2.id, goto_page_id: json_response[:data][4][:id] }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field2_to_update.id,
          type: 'custom_field',
          relationships: {
            options: { data: [
              {
                id: added_option2.id,
                type: 'custom_field_option'
              }
            ] },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
          }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 2 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][4]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 3 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 4,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 3' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add a field with logic referring to a new page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              description_multiloc: { 'en' => 'Description of question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 7,
              linear_scale_label_1_multiloc: { 'en' => 'Lowest' },
              linear_scale_label_2_multiloc: { 'en' => 'Low' },
              linear_scale_label_3_multiloc: { 'en' => 'Low-ish' },
              linear_scale_label_4_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_5_multiloc: { 'en' => 'High-ish' },
              linear_scale_label_6_multiloc: { 'en' => 'High' },
              linear_scale_label_7_multiloc: { 'en' => 'Highest' },
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: { 'en' => 'Page 2' },
              description_multiloc: { 'en' => 'Page 2 description' },
              required: false,
              enabled: true
            }
          ]
        }

        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Description of question 1 on page 1' },
            enabled: true,
            input_type: 'linear_scale',
            key: an_instance_of(String),
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Question 1 on page 1' },
            updated_at: an_instance_of(String),
            maximum: 7,
            linear_scale_label_1_multiloc: { en: 'Lowest' },
            linear_scale_label_2_multiloc: { en: 'Low' },
            linear_scale_label_3_multiloc: { en: 'Low-ish' },
            linear_scale_label_4_multiloc: { en: 'Neutral' },
            linear_scale_label_5_multiloc: { en: 'High-ish' },
            linear_scale_label_6_multiloc: { en: 'High' },
            linear_scale_label_7_multiloc: { en: 'Highest' },
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][2][:id] }]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Page 2 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add extra rule to field logic' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        field_to_update = create(
          :custom_field_linear_scale,
          resource: custom_form,
          title_multiloc: { 'en' => 'Question 1 on page 1' }
        )
        page2 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 2' }, description_multiloc: { 'en' => 'Page 2 description' })
        page3 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 3' }, description_multiloc: { 'en' => 'Page 3 description' })
        field_to_update.update!(
          logic: {
            rules: [{ if: 1, goto_page_id: page2.id }]
          },
          required: true
        )

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page1.title_multiloc,
              description_multiloc: page1.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: field_to_update.id,
              input_type: 'linear_scale',
              title_multiloc: { 'en' => 'Question 1 on page 1' },
              required: true,
              enabled: true,
              maximum: 5,
              linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
              linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
              linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
              linear_scale_label_4_multiloc: { 'en' => 'Agree' },
              linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
              linear_scale_label_6_multiloc: {},
              linear_scale_label_7_multiloc: {},
              logic: {
                rules: [
                  { if: 1, goto_page_id: page2.id },
                  { if: 2, goto_page_id: page3.id }
                ]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              page_layout: 'default',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data][0]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page1.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page1.key,
            ordering: 0,
            page_layout: 'default',
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field_to_update.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: field_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            maximum: 5,
            linear_scale_label_1_multiloc: field_to_update.linear_scale_label_1_multiloc.symbolize_keys,
            linear_scale_label_2_multiloc: field_to_update.linear_scale_label_2_multiloc.symbolize_keys,
            linear_scale_label_3_multiloc: field_to_update.linear_scale_label_3_multiloc.symbolize_keys,
            linear_scale_label_4_multiloc: field_to_update.linear_scale_label_4_multiloc.symbolize_keys,
            linear_scale_label_5_multiloc: field_to_update.linear_scale_label_5_multiloc.symbolize_keys,
            linear_scale_label_6_multiloc: field_to_update.linear_scale_label_6_multiloc.symbolize_keys,
            linear_scale_label_7_multiloc: field_to_update.linear_scale_label_7_multiloc.symbolize_keys,
            logic: {
              rules: [
                { if: 1, goto_page_id: page2.id },
                { if: 2, goto_page_id: page3.id }
              ]
            },
            constraints: {},
            random_option_ordering: false
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page2.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page2.key,
            ordering: 2,
            page_layout: 'default',
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(json_response[:data][3]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: page3.description_multiloc.symbolize_keys,
            enabled: true,
            input_type: 'page',
            key: page3.key,
            ordering: 3,
            page_layout: 'default',
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { map_config: { data: nil }, options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      example 'Add, edit, delete and reorder options of an existing custom field' do
        change_field = create(:custom_field_select, :with_options, resource: custom_form)
        change_option = change_field.options.first
        delete_option = change_field.options.last

        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: change_field.id,
              input_type: 'select',
              title_multiloc: { en: 'Changed field' },
              description_multiloc: {},
              required: true,
              enabled: true,
              options: [
                {
                  title_multiloc: { en: 'Option 1' }
                },
                {
                  id: change_option.id,
                  title_multiloc: { en: 'Changed option' }
                }
              ]
            }
          ]
        }
        do_request request

        assert_status 200
        json_response = json_parse response_body

        expect(json_response[:data].size).to eq 2
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            dropdown_layout: false,
            enabled: true,
            input_type: 'select',
            key: an_instance_of(String),
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Changed field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
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
            },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
          }
        })
        expect(CustomFieldOption.where(id: delete_option).count).to eq 0
        included_json_options = json_response[:included].select do |json_option|
          json_option[:type] == 'custom_field_option'
        end
        expect(included_json_options.size).to eq 2
        json_option1 = included_json_options.find do |json_option|
          json_option[:id] != change_option.id
        end
        json_option2 = included_json_options.find do |json_option|
          json_option[:id] == change_option.id
        end
        expect(json_option1).to match({
          id: an_instance_of(String),
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Option 1' },
            ordering: 0,
            other: false,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          },
          relationships: { image: { data: nil } }
        })
        expect(json_option2).to match({
          id: change_option.id,
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Changed option' },
            ordering: 1,
            other: false,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          },
          relationships: { image: { data: nil } }
        })
      end

      example 'Updating custom fields when there are responses' do
        create(:custom_field, resource: custom_form) # field to ensure custom form has been created
        create(:idea_status_proposed)
        create(:idea, project: context.project, phases: [context])

        do_request(custom_fields: [])

        assert_status 200
        expect(json_response_body).to eq({
          data: [],
          included: []
        })
      end

      example 'Adding and updating a field with text images' do
        field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
        request = {
          custom_fields: [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              title_multiloc: { 'en' => 'Inserted field' },
              description_multiloc: { 'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />' },
              input_type: 'number',
              required: false,
              enabled: false
            },
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'Updated field' },
              description_multiloc: { 'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />' },
              required: true,
              enabled: true
            }
          ]
        }
        expect { do_request request }.to change(TextImage, :count).by 2

        assert_status 200
      end

      example 'Updating fields only logs activities when they have changed' do
        page = create(:custom_field_page, resource: custom_form)
        field1 = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Field 1' })
        field2 = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Field 2' })
        request = {
          form_save_type: 'manual',
          custom_fields: [
            {
              id: page.id,
              input_type: 'page',
              page_layout: 'default'
            },
            {
              id: field1.id,
              title_multiloc: { 'en' => 'Field 1' }
            },
            {
              id: field2.id,
              title_multiloc: { 'en' => 'Field 2 changed' }
            }
          ]
        }

        # 1 for the field
        expect { do_request(request) }.to enqueue_job(LogActivityJob).with(field2, 'changed', any_args).exactly(1).times

        # 1 for the form
        request[:custom_fields][2][:title_multiloc] = { 'en' => 'Field 2 changed once more' }
        expect { do_request(request) }
          .to enqueue_job(LogActivityJob).with(
            custom_form,
            'changed',
            User.first,
            kind_of(Integer),
            payload: { save_type: 'manual', pages: 1, sections: 0, fields: 2, params_size: 877, form_opened_at: nil, form_updated_at: kind_of(Integer) },
            project_id: custom_form.project_id
          ).exactly(1).times
      end

      context "Update custom field's map config relation" do
        let!(:map_config1) { create(:map_config, mappable: nil) }
        let!(:map_config2) { create(:map_config, mappable: nil) }

        example "Relating map_config(s) with 'point' custom field(s)" do
          field_to_update = create(:custom_field_point, resource: custom_form, title_multiloc: { 'en' => 'Point field' })
          request = {
            custom_fields: [
              {
                input_type: 'page',
                page_layout: 'default'
              },
              {
                title_multiloc: { 'en' => 'Inserted point custom field' },
                description_multiloc: { 'en' => 'Inserted point custom field description' },
                input_type: 'point',
                required: false,
                enabled: false,
                map_config_id: map_config1.id
              },
              {
                id: field_to_update.id,
                title_multiloc: { 'en' => 'Updated point custom field' },
                description_multiloc: { 'en' => 'Updated custom point field description' },
                required: true,
                enabled: true,
                map_config_id: map_config2.id
              }
            ]
          }

          do_request request
          assert_status 200

          new_custom_field = map_config1.reload.mappable
          expect(new_custom_field.title_multiloc).to eq({ 'en' => 'Inserted point custom field' })
          expect(new_custom_field.input_type).to eq('point')

          updated_custom_field = CustomField.find(field_to_update.id)
          expect(updated_custom_field.map_config).to eq(map_config2)
          expect(updated_custom_field.title_multiloc).to eq({ 'en' => 'Updated point custom field' })
          expect(new_custom_field.input_type).to eq('point')
        end

        example "Relating map_config(s) with 'page' custom field(s)" do
          field_to_update = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page field' })
          request = {
            custom_fields: [
              {
                input_type: 'page',
                page_layout: 'default',
                title_multiloc: { 'en' => 'Inserted page custom field' },
                description_multiloc: { 'en' => 'Inserted page custom field description' },
                required: false,
                enabled: true,
                map_config_id: map_config1.id
              },
              {
                id: field_to_update.id,
                input_type: 'page',
                page_layout: 'default',
                title_multiloc: { 'en' => 'Updated page custom field' },
                description_multiloc: { 'en' => 'Updated page custom field description' },
                required: false,
                enabled: true,
                map_config_id: map_config2.id
              }
            ]
          }

          do_request request
          assert_status 200

          new_custom_field = map_config1.reload.mappable
          expect(new_custom_field.title_multiloc).to eq({ 'en' => 'Inserted page custom field' })
          expect(new_custom_field.input_type).to eq('page')

          updated_custom_field = CustomField.find(field_to_update.id)
          expect(updated_custom_field.map_config).to eq(map_config2)
          expect(updated_custom_field.title_multiloc).to eq({ 'en' => 'Updated page custom field' })
          expect(new_custom_field.input_type).to eq('page')
        end

        example '[errors] Responds with multiple numbered errors when such errors present', document: false do
          custom_field_point_with_map_config = create(:custom_field_point, resource: custom_form)
          create(:map_config, mappable_id: custom_field_point_with_map_config.id, mappable_type: 'CustomField')

          # request = {
          #   custom_fields: [
          #     page,
          #     [error] creating field of wrong input_type to have related map_config,
          #     [error] creating field related to non-existent map_config,
          #     [error] updating field - relating with map_config, when already related to other map_config
          #   ]
          # }
          request = {
            custom_fields: [
              {
                input_type: 'page',
                page_layout: 'default'
              },
              {
                title_multiloc: { 'en' => 'Inserted text custom field' },
                description_multiloc: { 'en' => 'Inserted text custom field description' },
                input_type: 'text',
                required: false,
                enabled: false,
                map_config_id: map_config1.id
              },
              {
                title_multiloc: { 'en' => 'Inserted point custom field' },
                description_multiloc: { 'en' => 'Inserted point custom field description' },
                input_type: 'point',
                required: false,
                enabled: false,
                map_config_id: SecureRandom.uuid
              },
              {
                id: custom_field_point_with_map_config.id,
                title_multiloc: { 'en' => 'Updating point custom field which is already mappable of other map_config' },
                description_multiloc: { 'en' => 'Updated point custom field description' },
                input_type: 'point',
                required: false,
                enabled: false,
                map_config_id: map_config2.id
              }
            ]
          }

          do_request request
          assert_status 422

          json_response = json_parse(response_body)
          expect(json_response[:errors]).to eq({
            '1': { map_config: { mappable: ['The custom field input_type cannot be related to a map_config'] } },
            '2': { map_config: ['map_config with an ID of map_config_id was not found'] },
            '3': { map_config: { mappable_id: ['has already been taken'] } }
          })
        end

        # This test documents the choice to force the FE to explicitly remove such a relationship
        # by sending a separate request to delete the map_config, using DELETE ...map_configs/:id.
        # i.e. map_config_id: nil, map_config_id: '', or ommitting map_config_id param will not remove the relation.
        example 'Absence of map_config_id does not remove existing relation', document: false do
          custom_field1 = create(:custom_field_page, resource: custom_form)
          map_config1 = create(:map_config, mappable_id: custom_field1.id, mappable_type: 'CustomField')
          custom_field2 = create(:custom_field_point, resource: custom_form)
          map_config2 = create(:map_config, mappable_id: custom_field2.id, mappable_type: 'CustomField')
          custom_field3 = create(:custom_field_point, resource: custom_form)
          map_config3 = create(:map_config, mappable_id: custom_field3.id, mappable_type: 'CustomField')
          custom_field4 = create(:custom_field_point, resource: custom_form)
          map_config4 = create(:map_config, mappable_id: custom_field4.id, mappable_type: 'CustomField')

          request = {
            custom_fields: [
              {
                id: custom_field1.id,
                input_type: 'page',
                page_layout: 'default',
                map_config_id: nil
              },
              {
                id: custom_field2.id,
                input_type: 'point'
              },
              {
                id: custom_field3.id,
                input_type: 'point',
                map_config_id: nil
              },
              {
                id: custom_field4.id,
                input_type: 'point',
                map_config_id: ''
              }
            ]
          }

          do_request request
          assert_status 200

          expect(custom_field1.reload.map_config).to eq(map_config1)
          expect(custom_field2.reload.map_config).to eq(map_config2)
          expect(custom_field3.reload.map_config).to eq(map_config3)
          expect(custom_field4.reload.map_config).to eq(map_config4)
        end
      end
    end
  end
end
