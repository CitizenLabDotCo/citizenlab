# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'idea_custom_fields'
  end

  context 'when the participation context is a project' do
    let(:context) { create :project }

    context 'when authenticated as admin' do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      get 'web_api/v1/admin/projects/:project_id/custom_fields' do
        let(:project_id) { context.id }
        let(:form) { create :custom_form, participation_context: context }
        let!(:custom_field) { create :custom_field, resource: form, key: 'extra_field1' }

        example_request 'List all allowed custom fields for a project' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data].size).to eq 8
          expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
            'title_multiloc', 'body_multiloc', 'proposed_budget', 'topic_ids',
            'location_description', 'idea_images_attributes', 'idea_files_attributes', custom_field.key
          ]
        end

        example 'List custom fields in the correct order', document: false do
          create :custom_field, resource: form, code: 'title_multiloc', key: 'title_multiloc'
          create :custom_field, resource: form, key: 'extra_field2'
          do_request
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq %w[
            title_multiloc body_multiloc proposed_budget topic_ids location_description
            idea_images_attributes idea_files_attributes extra_field1 extra_field2
          ]
        end
      end

      get 'web_api/v1/admin/projects/:project_id/custom_fields/:id' do
        let(:custom_field) { create(:custom_field, :for_custom_form) }
        let(:id) { custom_field.id }

        example_request 'Get one custom field by id' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq id
        end

        example 'Get one disabled field', document: false do
          custom_field.update! enabled: false
          do_request
          assert_status 200
          expect(json_parse(response_body).dig(:data, :id)).to eq id
        end
      end

      patch 'web_api/v1/admin/projects/:project_id/custom_fields/by_code/:code' do
        with_options scope: :custom_field do
          parameter :required, 'Whether filling out the field is mandatory', required: false
          parameter :enabled, 'Whether the field is active or not', required: false
          parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
        end

        let(:project_id) { context.id }
        let(:code) { 'location_description' }
        let(:required) { true }
        let(:enabled) { false }
        let(:description_multiloc) { { 'en' => 'New description' } }

        context "when the custom_form doesn't exist yet" do
          example 'Update a built-in custom field', document: false do
            do_request
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :attributes, :code)).to eq code
            expect(json_response.dig(:data, :attributes, :required)).to eq required
            expect(json_response.dig(:data, :attributes, :enabled)).to eq enabled
            expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
            expect(CustomField.count).to eq 1
            expect(CustomForm.count).to eq 1
            expect(context.reload.custom_form).to eq CustomForm.first
          end
        end

        context 'when the custom_form already exists' do
          let(:custom_form) { create :custom_form, participation_context: context }

          context 'when the field was not persisted yet' do
            example_request 'Update a built-in custom field' do
              assert_status 200
              json_response = json_parse(response_body)
              expect(json_response.dig(:data, :attributes, :code)).to eq code
              expect(json_response.dig(:data, :attributes, :required)).to eq required
              expect(json_response.dig(:data, :attributes, :enabled)).to eq enabled
              expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
              expect(CustomField.count).to eq 1
            end

            example 'Update a disabled field', document: false do
              create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: code
              do_request(custom_field: { enabled: true })
              assert_status 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :attributes, :enabled)).to be true
            end
          end

          context 'when the field is already persisted' do
            example 'Update a built-in custom field', document: false do
              cf = create(:custom_field, resource: custom_form, code: code, required: !required)
              do_request
              assert_status 200
              json_response = json_parse(response_body)
              expect(json_response.dig(:data, :id)).to eq cf.id
              expect(json_response.dig(:data, :attributes, :code)).to eq code
              expect(json_response.dig(:data, :attributes, :required)).to eq required
              expect(json_response.dig(:data, :attributes, :enabled)).to eq enabled
              expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
              expect(CustomField.count).to eq 1
            end
          end
        end

        context 'when the idea_custom_fields feature is deactivated' do
          before { SettingsService.new.deactivate_feature! 'idea_custom_fields' }

          example_request '[error] Updating is not authorized' do
            assert_status 401
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:base, '"idea_custom_fields" feature is not activated')
          end
        end

        context 'when images are included in the description' do
          let(:description_multiloc) do
            {
              'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
            }
          end

          example 'Update a field', document: false do
            expect { do_request }.to change(TextImage, :count).by 1
            assert_status 200
          end
        end
      end

      patch 'web_api/v1/admin/projects/:project_id/custom_fields/update/:id' do
        with_options scope: :custom_field do
          parameter :required, 'Whether filling out the field is mandatory', required: false
          parameter :enabled, 'Whether the field is active or not', required: false
          parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
        end

        let(:project_id) { context.id }
        let(:required) { true }
        let(:enabled) { false }
        let(:description_multiloc) { { 'en' => 'New description' } }
        let(:custom_form) { create :custom_form, participation_context: context }
        let(:custom_field) { create :custom_field, resource: custom_form, required: !required }
        let(:id) { custom_field.id }

        example 'Update an extra custom field', document: false do
          do_request
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq custom_field.id
          expect(json_response.dig(:data, :attributes, :code)).to eq custom_field.code
          expect(json_response.dig(:data, :attributes, :required)).to eq required
          expect(json_response.dig(:data, :attributes, :enabled)).to eq enabled
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(CustomField.count).to eq 1
        end

        context 'when images are included in the description' do
          let(:description_multiloc) do
            {
              'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
            }
          end

          example 'Update a field', document: false do
            expect { do_request }.to change(TextImage, :count).by 1
            assert_status 200
          end
        end
      end

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

        let(:context) { create :continuous_project, participation_method: 'native_survey' }
        let(:custom_form) { create :custom_form, participation_context: context }
        let(:project_id) { context.id }

        example '[error] Invalid data in fields' do
          field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
          request = {
            custom_fields: [
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
                          # Missing target_id
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
            '0': {
              input_type: [
                { error: 'blank' },
                { error: 'inclusion', value: nil }
              ]
            },
            '1': {
              title_multiloc: [{ error: 'blank' }]
            },
            '2': {
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
                id: field_to_update.id,
                title_multiloc: { 'en' => 'New title' },
                required: true,
                enabled: true,
                logic: {
                  rules: [
                    {
                      if: field_to_update.options.first.key,
                      then: [
                        {
                          effect: 'show'
                          # Missing target_id
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
            '0': {
              logic: [
                { error: 'invalid_structure' }
              ]
            }
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
          field_to_update.update!(
            logic: {
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
                logic: {
                  rules: [
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: page3.id
                        }
                      ]
                    }
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: page3.id
                      }
                    ]
                  }
                ]
              }
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
            },
            id: page3.id,
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
                logic: {
                  rules: [
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: 'temp_1'
                        }
                      ]
                    }
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
                temp_id: 'temp_1',
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: json_response[:data][3][:id]
                      }
                    ]
                  }
                ]
              }
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
              updated_at: an_instance_of(String)
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
              key: 'page_3',
              ordering: 3,
              required: false,
              title_multiloc: { en: 'Page 3' },
              updated_at: an_instance_of(String)
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
                logic: {
                  rules: [
                    {
                      if: 1,
                      then: [
                        {
                          effect: 'hide',
                          target_id: page2.id
                        }
                      ]
                    }
                  ]
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 1,
                    then: [
                      {
                        effect: 'hide',
                        target_id: page2.id
                      }
                    ]
                  }
                ]
              }
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
              updated_at: an_instance_of(String)
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
              logic: {}
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
              updated_at: an_instance_of(String)
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
              updated_at: an_instance_of(String)
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
              logic: {}
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
              updated_at: an_instance_of(String)
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
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                },
                {
                  if: 2,
                  then: [
                    {
                      effect: 'show',
                      target_id: page3.id
                    }
                  ]
                }
              ]
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
                logic: {
                  rules: [
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: page3.id
                        }
                      ]
                    }
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: page3.id
                      }
                    ]
                  }
                ]
              }
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
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
                required: false,
                enabled: true,
                maximum: 5,
                minimum_label_multiloc: { 'en' => 'Strongly disagree' },
                maximum_label_multiloc: { 'en' => 'Strongly agree' },
                logic: {
                  rules: [
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: 'temp_1'
                        }
                      ]
                    }
                  ]
                }
              },
              {
                temp_id: 'temp_1',
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: json_response[:data][2][:id]
                      }
                    ]
                  }
                ]
              }
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
              key: 'page_2',
              ordering: 2,
              required: false,
              title_multiloc: { en: 'Page 2' },
              updated_at: an_instance_of(String)
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
                required: false,
                enabled: true,
                maximum: 5,
                minimum_label_multiloc: { 'en' => 'Strongly disagree' },
                maximum_label_multiloc: { 'en' => 'Strongly agree' },
                logic: {
                  rules: [
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: 'temp_1'
                        }
                      ]
                    }
                  ]
                }
              },
              {
                temp_id: 'temp_1',
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
              updated_at: an_instance_of(String)
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
              required: false,
              title_multiloc: { en: 'Question 1 on page 1' },
              updated_at: an_instance_of(String),
              maximum: 5,
              minimum_label_multiloc: { en: 'Strongly disagree' },
              maximum_label_multiloc: { en: 'Strongly agree' },
              logic: {
                rules: [
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: json_response[:data][2][:id]
                      }
                    ]
                  }
                ]
              }
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
              key: 'page_2',
              ordering: 2,
              required: false,
              title_multiloc: { en: 'Page 2' },
              updated_at: an_instance_of(String)
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
              rules: [
                {
                  if: 1,
                  then: [
                    {
                      effect: 'hide',
                      target_id: page2.id
                    }
                  ]
                }
              ]
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
                logic: {
                  rules: [
                    {
                      if: 1,
                      then: [
                        {
                          effect: 'hide',
                          target_id: page2.id
                        }
                      ]
                    },
                    {
                      if: 2,
                      then: [
                        {
                          effect: 'show',
                          target_id: page3.id
                        }
                      ]
                    }
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
              updated_at: an_instance_of(String)
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
              logic: {
                rules: [
                  {
                    if: 1,
                    then: [
                      {
                        effect: 'hide',
                        target_id: page2.id
                      }
                    ]
                  },
                  {
                    if: 2,
                    then: [
                      {
                        effect: 'show',
                        target_id: page3.id
                      }
                    ]
                  }
                ]
              }
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
            },
            id: page3.id,
            type: 'custom_field',
            relationships: { options: { data: [] } }
          })
        end

        example 'Add, edit, delete and reorder options of an existing custom field' do
          change_field = create :custom_field_select, :with_options, resource: custom_form
          change_option = change_field.options.first
          delete_option = change_field.options.last

          request = {
            custom_fields: [
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

          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].first).to match({
            attributes: {
              code: nil,
              created_at: an_instance_of(String),
              description_multiloc: {},
              enabled: true,
              input_type: 'select',
              key: an_instance_of(String),
              ordering: 0,
              required: true,
              title_multiloc: { en: 'Changed field' },
              updated_at: an_instance_of(String),
              logic: {}
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

        example '[error] Updating custom fields in a continuous native survey project when there are responses' do
          IdeaStatus.create_defaults
          create :idea, project: context

          do_request(custom_fields: [])

          assert_status 401
          expect(json_response_body).to eq({ error: 'updating_form_with_input' })
        end

        context 'in a continuous ideation project' do
          let(:context) { create :continuous_project, participation_method: 'ideation' }

          example 'Updating custom fields when there are responses' do
            IdeaStatus.create_defaults
            create :idea, project: context

            do_request(custom_fields: [])

            assert_status 200
          end
        end

        example 'Adding and updating a field with text images' do
          field_to_update = create :custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' }
          request = {
            custom_fields: [
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

  context 'when the participation context is a phase' do
    let(:context) { create :phase, participation_method: 'native_survey' }

    context 'when authenticated as admin' do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      get 'web_api/v1/admin/phases/:phase_id/custom_fields' do
        let(:phase_id) { context.id }
        let(:form) { create :custom_form, participation_context: context }
        let!(:custom_field1) { create :custom_field, resource: form, key: 'extra_field1' }
        let!(:custom_field2) { create :custom_field, resource: form, key: 'extra_field2' }

        example_request 'List all allowed custom fields for a phase' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
            custom_field1.key,
            custom_field2.key
          ]
        end
      end

      patch 'web_api/v1/admin/phases/:phase_id/custom_fields/update_all' do
        parameter :custom_fields, type: :array
        with_options scope: 'custom_fields[]' do
          parameter :id, 'The ID of an existing custom field to update. When the ID is not provided, a new field is created.', required: false
          parameter :input_type, 'The type of the input. Required when creating a new field.', required: false
          parameter :required, 'Whether filling out the field is mandatory', required: false
          parameter :enabled, 'Whether the field is active or not', required: false
          parameter :title_multiloc, 'A title of the field, as shown to users, in multiple locales', required: false
          parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
        end

        let(:custom_form) { create :custom_form, participation_context: context }
        let(:phase_id) { context.id }

        example 'Insert one field, update one field, and destroy one field' do
          field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
          create(:custom_field, resource: custom_form) # field to destroy
          request = {
            custom_fields: [
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
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data][0]).to match({
            attributes: {
              code: nil,
              created_at: an_instance_of(String),
              description_multiloc: {},
              enabled: false,
              input_type: 'text',
              key: 'inserted_field',
              ordering: 0,
              required: false,
              title_multiloc: { en: 'Inserted field' },
              updated_at: an_instance_of(String),
              logic: {}
            },
            id: an_instance_of(String),
            type: 'custom_field',
            relationships: { options: { data: [] } }
          })
          expect(json_response[:data][1]).to match({
            attributes: {
              code: nil,
              created_at: an_instance_of(String),
              description_multiloc: { en: 'Which councils are you attending in our city?' },
              enabled: true,
              input_type: 'text',
              key: field_to_update.key,
              ordering: 1,
              required: true,
              title_multiloc: { en: 'Updated field' },
              updated_at: an_instance_of(String),
              logic: {}
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
          delete_field = create :custom_field_select, :with_options, resource: custom_form
          delete_options = delete_field.options

          request = {
            custom_fields: [
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
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].first).to match({
            attributes: {
              code: nil,
              created_at: an_instance_of(String),
              description_multiloc: {},
              enabled: true,
              input_type: 'multiselect',
              key: 'inserted_field',
              ordering: 0,
              required: false,
              title_multiloc: { en: 'Inserted field' },
              updated_at: an_instance_of(String),
              logic: {}
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
          options = CustomField.find(json_response.dig(:data, 0, :id)).options
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
          create_list :custom_field_select, 2, :with_options, resource: custom_form

          do_request custom_fields: []

          assert_status 200
          json_response = json_parse response_body

          expect(CustomField.where(resource: custom_form).count).to eq 0
          expect(CustomFieldOption.where(custom_field: CustomField.where(resource: custom_form)).count).to eq 0
          expect(json_response[:data].size).to eq 0
        end

        example 'Remove all options of a custom field' do
          field = create :custom_field_select, :with_options, resource: custom_form

          request = {
            custom_fields: [
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
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].first).to match({
            attributes: {
              code: nil,
              created_at: an_instance_of(String),
              description_multiloc: an_instance_of(Hash),
              enabled: true,
              input_type: 'select',
              key: field.key,
              ordering: 0,
              required: true,
              title_multiloc: { en: 'Updated field' },
              updated_at: an_instance_of(String),
              logic: {}
            },
            id: an_instance_of(String),
            type: 'custom_field',
            relationships: { options: { data: [] } }
          })
        end

        example '[error] Updating custom fields in a native survey phase when there are responses' do
          IdeaStatus.create_defaults
          create :idea, project: context.project, creation_phase: context, phases: [context]

          do_request(custom_fields: [])

          assert_status 401
          expect(json_response_body).to eq({ error: 'updating_form_with_input' })
        end

        example 'Updating custom fields in a native survey phase when there are no responses' do
          ideation_phase = create :phase, participation_method: 'ideation', project: context.project, start_at: (context.start_at - 7.days), end_at: (context.start_at - 1.day)
          create :idea, project: ideation_phase.project, phases: [ideation_phase]
          create :idea, project: ideation_phase.project

          do_request(custom_fields: [])

          assert_status 200
        end

        context 'in an ideation phase' do
          let(:context) { create :phase, participation_method: 'ideation' }

          example 'Updating custom fields when there are ideas' do
            create :idea, project: context.project, phases: [context]
            create :idea, project: context.project

            do_request(custom_fields: [])

            assert_status 200
          end
        end
      end
    end
  end
end
