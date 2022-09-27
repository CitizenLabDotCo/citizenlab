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
        end
        with_options scope: 'options[]' do
          parameter :id, 'The ID of an existing custom field option to update. When the ID is not provided, a new option is created.', required: false
          parameter :title_multiloc, 'A title of the option, as shown to users, in multiple locales', required: false
        end

        let(:context) { create :continuous_project, participation_method: 'native_survey' }
        let(:custom_form) { create :custom_form, participation_context: context }
        let(:project_id) { context.id }

        example '[error] Invalid data' do
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
                    title_multiloc: { 'en' => '' }
                  }
                ]
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
            }
          })
        end

        example 'Insert one field, update one field, and destroy one field' do
          field_to_update = create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Some field' })
          create(:custom_field, resource: custom_form) # field to destroy
          request = {
            custom_fields: [
              # Inserted field first to test reordering of fields.
              {
                input_type: 'linear_scale',
                title_multiloc: { 'en' => 'Inserted field' },
                required: false,
                enabled: false,
                maximum: 7,
                minimum_label_multiloc: { 'en' => 'Disagree' },
                maximum_label_multiloc: { 'en' => 'Agree' }
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
              input_type: 'linear_scale',
              key: 'inserted_field',
              ordering: 0,
              required: false,
              title_multiloc: { en: 'Inserted field' },
              updated_at: an_instance_of(String),
              maximum: 7,
              minimum_label_multiloc: { en: 'Disagree' },
              maximum_label_multiloc: { en: 'Agree' }
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
              updated_at: an_instance_of(String)
            },
            id: an_instance_of(String),
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
            },
            id: an_instance_of(String),
            type: 'custom_field',
            relationships: { options: { data: [] } }
          })
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
              updated_at: an_instance_of(String)
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
              updated_at: an_instance_of(String)
            },
            id: an_instance_of(String),
            type: 'custom_field',
            relationships: { options: { data: [] } }
          })
        end
      end
    end
  end
end
