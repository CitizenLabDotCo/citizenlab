# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/admin/projects/:project_id/custom_fields/update_all' do
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

    context 'when admin' do
      before { admin_header_token }

      let(:context) { create(:continuous_project, participation_method: 'native_survey') }
      let(:custom_form) { create(:custom_form, participation_context: context) }
      let(:project_id) { context.id }

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
              { input_type: 'page' },
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
            { input_type: 'page' },
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
              { error: 'blank' },
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
            { input_type: 'page' },
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 2, goto_page_id: page3.id }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: page3.id }]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: { next_page_id: page4.id }
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page4.id,
              input_type: 'page',
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
            key: page_to_update.key,
            ordering: 0,
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: { next_page_id: page4.id },
            constraints: {}
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page4.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page4.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: { next_page_id: 'TEMP-ID-1' },
              constraints: {}
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
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
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: { next_page_id: json_response[:data][3][:id] },
            constraints: {}
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: { en: 'Page 4' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
      end

      example 'Add a page with logic referring to a new page' do
        existing_page = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })
        request = {
          custom_fields: [
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
              title_multiloc: { 'en' => 'New page with logic' },
              description_multiloc: { 'en' => 'New page with logic description' },
              required: false,
              enabled: true,
              logic: { next_page_id: 'TEMP-ID-2' }
            },
            {
              id: existing_page.id,
              input_type: 'page',
              title_multiloc: existing_page.title_multiloc,
              description_multiloc: existing_page.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-2',
              input_type: 'page',
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
            required: false,
            title_multiloc: { en: 'New page with logic' },
            updated_at: an_instance_of(String),
            logic: { next_page_id: json_response[:data][2][:id] },
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: existing_page.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: existing_page.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: { en: 'Target page' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              title_multiloc: page_to_update.title_multiloc,
              description_multiloc: page_to_update.description_multiloc,
              required: false,
              enabled: true,
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page_to_update.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][3][:id] }]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: { en: 'Page 3' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 1, goto_page_id: page2.id }]
              }
            },
            {
              id: page3.id,
              input_type: 'page',
              title_multiloc: page3.title_multiloc,
              description_multiloc: page3.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page2.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 1, goto_page_id: page2.id }]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {}
            },
            {
              id: page2.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {},
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {},
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 2, goto_page_id: page3.id }]
              }
            },
            {
              id: page2.id,
              input_type: 'page',
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: page3.id }]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][2][:id] }]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
                rules: [{ if: 'TEMP-ID-2', goto_page_id: 'TEMP-ID-1' }]
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
              title_multiloc: { 'en' => 'Page 2' },
              description_multiloc: { 'en' => 'Page 2 description' },
              required: false,
              enabled: true
            },
            {
              temp_id: 'TEMP-ID-3',
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
        expect(json_response[:data][1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field1_to_update.description_multiloc.symbolize_keys,
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
            constraints: {}
          },
          id: field1_to_update.id,
          type: 'custom_field',
          relationships: {
            options: { data: [
              {
                id: added_option1.id,
                type: 'custom_field_option'
              }
            ] }
          }
        })
        expect(json_response[:data][2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: field2_to_update.description_multiloc.symbolize_keys,
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
            constraints: {}
          },
          id: field2_to_update.id,
          type: 'custom_field',
          relationships: {
            options: { data: [
              {
                id: added_option2.id,
                type: 'custom_field_option'
              }
            ] }
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
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: { en: 'Page 3' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
      end

      example 'Add a field with logic referring to a new page' do
        page1 = create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Page 1' }, description_multiloc: { 'en' => 'Page 1 description' })

        request = {
          custom_fields: [
            {
              id: page1.id,
              input_type: 'page',
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
              maximum: 5,
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
              logic: {
                rules: [{ if: 2, goto_page_id: 'TEMP-ID-1' }]
              }
            },
            {
              temp_id: 'TEMP-ID-1',
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            maximum: 5,
            minimum_label_multiloc: { en: 'Strongly disagree' },
            maximum_label_multiloc: { en: 'Strongly agree' },
            logic: {
              rules: [{ if: 2, goto_page_id: json_response[:data][2][:id] }]
            },
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
            description_multiloc: { en: 'Page 2 description' },
            enabled: true,
            input_type: 'page',
            key: nil,
            ordering: 2,
            required: false,
            title_multiloc: { en: 'Page 2' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
              minimum_label_multiloc: { 'en' => 'Strongly disagree' },
              maximum_label_multiloc: { 'en' => 'Strongly agree' },
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
              title_multiloc: page2.title_multiloc,
              description_multiloc: page2.description_multiloc,
              required: false,
              enabled: true
            },
            {
              id: page3.id,
              input_type: 'page',
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
            required: false,
            title_multiloc: page1.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page1.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            minimum_label_multiloc: field_to_update.minimum_label_multiloc.symbolize_keys,
            maximum_label_multiloc: field_to_update.maximum_label_multiloc.symbolize_keys,
            logic: {
              rules: [
                { if: 1, goto_page_id: page2.id },
                { if: 2, goto_page_id: page3.id }
              ]
            },
            constraints: {}
          },
          id: field_to_update.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page2.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page2.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
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
            required: false,
            title_multiloc: page3.title_multiloc.symbolize_keys,
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {}
          },
          id: page3.id,
          type: 'custom_field',
          relationships: { options: { data: [] } }
        })
      end

      example 'Add, edit, delete and reorder options of an existing custom field' do
        change_field = create(:custom_field_select, :with_options, resource: custom_form)
        change_option = change_field.options.first
        delete_option = change_field.options.last

        request = {
          custom_fields: [
            { input_type: 'page' },
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
            enabled: true,
            input_type: 'select',
            key: an_instance_of(String),
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Changed field' },
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
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          }
        })
        expect(json_option2).to match({
          id: change_option.id,
          type: 'custom_field_option',
          attributes: {
            key: an_instance_of(String),
            title_multiloc: { en: 'Changed option' },
            ordering: 1,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String)
          }
        })
      end

      example 'Adding and updating a field with text images' do
        field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
        request = {
          custom_fields: [
            { input_type: 'page' },
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
    end
  end
end
