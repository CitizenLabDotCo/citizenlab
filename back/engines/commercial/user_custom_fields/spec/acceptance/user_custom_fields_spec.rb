# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Fields' do
  explanation 'Fields in forms (e.g. registration) which are customized by the city.'

  before do
    header 'Content-Type', 'application/json'
    @custom_fields = create_list(:custom_field, 3)
  end

  get 'web_api/v1/users/custom_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of custom fields per page'
    end
    parameter :input_types, "Array of input types. Only return custom fields for the given types. Allowed values: #{CustomField::INPUT_TYPES.join(', ')}", required: false

    example 'List all accessible custom fields' do
      create(:custom_field, enabled: false)
      create(:custom_field, hidden: true)
      do_request
      assert_status 200
      expect(json_response_body[:data].size).to eq 3
    end

    example 'List all custom fields with the projects that they are used in' do
      phase_project = create(:project_with_phases)
      phase_permission = create(:permission, permission_scope: phase_project.phases.first)
      create(:permissions_custom_field, custom_field: @custom_fields[0], permission: phase_permission)

      do_request
      assert_status 200
      expect(json_response_body.dig(:data, 0, :relationships, :projects, :data, 0, :id)).to eq phase_project.id
      expect(json_response_body.dig(:included, 0, :id)).to eq phase_project.id
    end

    describe 'do filter on input types' do
      before do
        create(:custom_field_multiselect)
        create(:custom_field_checkbox)
        create(:custom_field_date)
      end

      let(:input_types) { %w[multiselect checkbox] }

      example_request 'List custom fields filtered by input types' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end

  get 'web_api/v1/users/custom_fields/:id' do
    let(:id) { custom_field.id }
    let(:expected_response) do
      {
        id: id,
        type: 'user_custom_field',
        attributes: hash_including(
          key: custom_field.key,
          input_type: custom_field.input_type,
          title_multiloc: custom_field.title_multiloc.symbolize_keys,
          description_multiloc: custom_field.description_multiloc.symbolize_keys,
          required: custom_field.required?,
          hidden: custom_field.hidden?,
          enabled: custom_field.enabled?,
          ordering: custom_field.ordering,
          code: custom_field.code,
          created_at: custom_field.created_at.as_json,
          updated_at: custom_field.updated_at.as_json,
          logic: {}
        ),
        relationships: {
          current_ref_distribution: expected_ref_distribution_linkage,
          options: {
            data: custom_field.options.map do |option|
              { id: option.id, type: 'custom_field_option' }
            end
          },
          projects: { data: [] },
          resource: { data: nil }
        }
      }.deep_symbolize_keys
    end

    context 'when the custom field has a reference distribution' do
      let(:ref_distribution) { create(:categorical_distribution) }
      let(:custom_field) { ref_distribution.custom_field }
      let(:expected_ref_distribution_linkage) do
        { data: { type: 'categorical_distribution', id: ref_distribution.id } }
      end

      example_request 'Get one custom field by id' do
        assert_status 200
        expect(response_data).to match(expected_response)
      end
    end

    context 'when the custom field does not have a reference distribution' do
      let(:custom_field) { @custom_fields.first }
      let(:expected_ref_distribution_linkage) { { data: nil } }

      example_request 'Get one custom field by id with reference distribution' do
        assert_status 200
        expect(response_data).to match(expected_response)
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/users/custom_fields' do
      with_options scope: :custom_field do
        parameter :key, "A unique internal name for the field. Only letters, numbers and underscores allowed. Auto-generated from the title if not provided. Can't be changed afterwards", required: false
        parameter :input_type, "The type of input presented to the user. One of #{CustomField::INPUT_TYPES.join(', ')}. Can't be changed afterwards", required: true
        parameter :title_multiloc, 'The title of the field as shown to users, in multiple locales', required: true
        parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
        parameter :required, 'Whether filling out the field is mandatory. Defaults to false', required: false
        parameter :enabled, 'Whether the field is active or not. Defaults to true', required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:custom_field) { build(:custom_field, enabled: true) }

      describe 'Create an enabled custom field' do
        let(:key) { custom_field.key }
        let(:input_type) { custom_field.input_type }
        let(:title_multiloc) { custom_field.title_multiloc }
        let(:description_multiloc) { custom_field.description_multiloc }
        let(:required) { custom_field.required }
        let(:enabled) { custom_field.enabled }

        example 'Create an enabled custom field' do
          do_request
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :key)).to match key
          expect(json_response.dig(:data, :attributes, :input_type)).to match input_type
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :hidden)).to be false
          expect(json_response.dig(:data, :attributes, :required)).to match required
          expect(json_response.dig(:data, :attributes, :enabled)).to match enabled
        end
      end

      describe 'Invalid custom fields' do
        let(:key) { 'No spaces allowed' }
        let(:title_multiloc) { { 'en' => '' } }

        example '[error] Create an invalid custom field', document: false do
          do_request
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:key, 'invalid', value: key)
          expect(json_response).to include_response_error(:title_multiloc, 'blank')
        end
      end

      context 'when images are included in the description' do
        let(:input_type) { custom_field.input_type }
        let(:title_multiloc) { custom_field.title_multiloc }
        let(:description_multiloc) do
          {
            'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
          }
        end

        example 'Create a field', document: false do
          expect { do_request }.to change(TextImage, :count).by 1
          assert_status 201
        end
      end
    end

    patch 'web_api/v1/users/custom_fields/:id' do
      with_options scope: :custom_field do
        parameter :title_multiloc, 'The title of the field as shown to users, in multiple locales', required: false
        parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
        parameter :required, 'Whether filling out the field is mandatory', required: false
        parameter :enabled, 'Whether the field is active or not', required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:field) { create(:custom_field, enabled: false) }
      let(:id) { field.id }
      let(:title_multiloc) { { 'en' => 'New title' } }
      let(:description_multiloc) { { 'en' => 'New description' } }
      let(:required) { true }

      context 'Enabling a custom field' do
        let(:enabled) { true }

        before { field } # Ensure field created before example runs

        example 'Update & enable a custom field' do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :required)).to match required
          expect(json_response.dig(:data, :attributes, :enabled)).to match enabled
        end
      end

      context 'Disabling a custom field' do
        let!(:field) { create(:custom_field, enabled: true) }
        let(:enabled) { false }

        example 'Update & disable a custom field' do
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :required)).to match required
          expect(json_response.dig(:data, :attributes, :enabled)).to match enabled
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

    patch 'web_api/v1/users/custom_fields/:id/reorder' do
      with_options scope: :custom_field do
        parameter :ordering, 'The position, starting from 0, where the field should be at. Fields after will move down.', required: true
      end

      let(:custom_field) { create(:custom_field) }
      let(:id) { custom_field.id }
      let(:ordering) { 1 }

      example 'Reorder a custom field' do
        expect(custom_field.ordering).to eq 3
        do_request
        assert_status 200
        expect(response_data.dig(:attributes, :ordering)).to match ordering
        expect(custom_field.reload.ordering).to eq 1
        expect(CustomField.registration.order(:ordering)[1].id).to eq id
        expect(CustomField.registration.order(:ordering).map(&:ordering)).to eq (0..3).to_a
      end

      example 'Fix the custom field order when ordering has gone wrong' do
        ActiveRecord::Base.connection.execute("UPDATE custom_fields SET ordering = 0 WHERE id != '#{custom_field.id}'")
        expect(custom_field.ordering).to eq 3
        expect(CustomField.registration.order(:ordering).map(&:ordering)).to eq [0, 0, 0, 3]
        do_request
        expect(response_status).to eq 200
        assert_status 200
        expect(response_data.dig(:attributes, :ordering)).to match ordering
        expect(custom_field.reload.ordering).to eq 1
        expect(CustomField.registration.order(:ordering)[1].id).to eq id
        expect(CustomField.registration.order(:ordering).map(&:ordering)).to eq (0..3).to_a
      end
    end

    delete 'web_api/v1/users/custom_fields/:id' do
      let(:custom_field) { create(:custom_field, key: 'new_field') }
      let(:id) { custom_field.id }

      example 'Delete a custom field, user saved values and permission relationships' do
        permission = create(:permission)
        permissions_custom_field = create(:permissions_custom_field, custom_field: custom_field, permission: permission)
        user_with_fields = create(:user, custom_field_values: { new_field: 'a value' })

        do_request
        expect(response_status).to eq 200
        expect { CustomField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect { PermissionsCustomField.find(permissions_custom_field.id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(user_with_fields.reload.custom_field_values).to eq({})
      end

      example "[error] Delete a custom field that's still referenced in a rules group" do
        create(
          :smart_group,
          rules: [
            { ruleType: 'custom_field_text', customFieldId: custom_field.id, predicate: 'is_empty' }
          ]
        )
        do_request
        assert_status 422
        expect(CustomField.find(custom_field.id)).to be_present
      end
    end
  end
end
