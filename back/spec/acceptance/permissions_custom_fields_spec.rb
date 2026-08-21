# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PermissionsCustomField' do
  explanation 'Associations between permissions and registration fields that should be specified to be granted permission.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  let(:permission_scope) { nil }
  let(:action) { 'visiting' }
  let(:permitted_by) { 'users' }
  # Demographic questions are only editable once the permission has been switched
  # to 'custom', so that is what most of these examples need.
  let(:custom_fields_behavior) { 'custom' }
  let(:permission) do
    create(
      :permission,
      permission_scope: permission_scope,
      action: action,
      permitted_by: permitted_by,
      custom_fields_behavior: custom_fields_behavior
    )
  end

  get 'web_api/v1/ideas/:idea_id/permissions/:action/permissions_custom_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of permissions fields per page'
    end

    let(:project) { create(:single_phase_ideation_project) }
    let(:permission_scope) { project.phases.first }
    let(:action) { 'commenting_idea' }
    let(:idea_id) { create(:idea, project: project).id }

    before do
      permission # Create permission
    end

    example 'List all default permissions fields of a "user" permission' do
      permission.update!(custom_fields_behavior: 'global')
      custom_field = create(:custom_field_gender, required: false, enabled: true)

      do_request

      assert_status 200
      expect(response_data.size).to eq 1
      expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [false]
      expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to contain_exactly(permission.id)
      expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
    end

    example 'List all persisted permissions fields and associated groups of a "user" permission' do
      # Permissions field not associated with any group
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_gender))

      # Permissions field associated with one group
      custom_field = create(:custom_field_text, :for_registration, title_multiloc: { en: 'TEST FIELD' }, enabled: true, required: false)
      associated_group = create(:smart_group, slug: 'used', rules: [
        { ruleType: 'custom_field_text', customFieldId: custom_field.id, predicate: 'is', value: 'abc' }
      ])
      not_used_group = create(:smart_group, slug: 'not-used', rules: [
        { ruleType: 'custom_field_text', customFieldId: SecureRandom.uuid, predicate: 'is', value: 'xyz' }
      ])
      permission.groups << associated_group
      permission.groups << not_used_group
      create(:permissions_custom_field, permission: permission, custom_field: custom_field)

      do_request

      assert_status 200

      expect(response_data.size).to eq 2
      expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true, true]
      expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to contain_exactly(permission.id, permission.id)
      expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
      expect(response_data.last.dig(:relationships, :groups, :data).count).to eq 1
      expect(response_data.last.dig(:relationships, :groups, :data).pluck(:id)).to include associated_group.id
      expect(response_data.last.dig(:relationships, :groups, :data).pluck(:id)).not_to include not_used_group.id
    end
  end

  get 'web_api/v1/permissions_custom_fields/:id' do
    let(:id) { create(:permissions_custom_field).id }

    example_request 'Get one permissions custom fields by id' do
      assert_status 200

      expect(response_data[:id]).to eq id
      expect(response_data.dig(:attributes, :created_at)).to be_present
      expect(response_data[:attributes].keys).to match_array(%i[required ordering lock title_multiloc created_at updated_at persisted])
    end
  end

  post 'web_api/v1/permissions/:action/permissions_custom_fields' do
    with_options scope: :permissions_custom_field do
      parameter :required, 'Whether filling out the field is mandatory. Defaults to true'
      parameter :custom_field_id, 'The associated registration field', required: true
    end
    ValidationErrorHelper.new.error_fields self, PermissionsCustomField

    let(:required) { false }
    let(:custom_field_id) { create(:custom_field, enabled: false).id }

    before do
      create(:custom_field_gender, enabled: true) # A platform-wide demographic question
      permission # Create permission
    end

    example_request 'Create a new permission custom field association' do
      assert_status 201

      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships, :custom_field, :data, :id)).to eq custom_field_id
      expect(json_response.dig(:data, :attributes, :required)).to eq required
      # A permission on 'custom' starts empty: the platform-wide questions are
      # not copied onto it.
      expect(PermissionsCustomField.all.count).to eq 1
    end

    context 'the permissions_custom_fields feature is deactivated' do
      before { SettingsService.new.deactivate_feature!('permissions_custom_fields') }

      example_request '[ERROR] Fields cannot be added without the feature' do
        assert_status 401
        expect(PermissionsCustomField.where(custom_field_id: custom_field_id)).to be_empty
      end
    end
  end

  patch 'web_api/v1/permissions_custom_fields/:id' do
    with_options scope: :permissions_custom_field do
      parameter :required, 'Whether filling out the field is mandatory'
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end
    ValidationErrorHelper.new.error_fields self, PermissionsCustomField

    context 'fields already exist' do
      let(:permissions_custom_field) { create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_gender)) }
      let(:id) { permissions_custom_field.id }
      let(:required) { true }

      example_request 'Update a permissions custom field' do
        assert_status 200
        expect(response_data.dig(:attributes, :required)).to be true
      end
    end

    context 'no field is found for the given id' do
      let(:id) { SecureRandom.uuid }
      let(:required) { true }

      context 'permission and custom field IDs are NOT provided' do
        example_request '[ERROR] permission custom field not found' do
          assert_status 404
        end
      end

      context 'permission ID is provided but custom field ID does NOT exist' do
        let(:custom_field_id) { 'NOTHING_TO_SEE_HERE' }
        let(:permission_id) { permission.id }

        example_request '[ERROR] permission custom field not found' do
          assert_status 404
        end
      end

      context 'custom field ID is provided but permission ID does NOT exist' do
        let(:custom_field_id) { create(:custom_field_gender, enabled: true).id }
        let(:permission_id) { 'NOTHING_TO_SEE_HERE' }

        example_request '[ERROR] permission custom field not found' do
          assert_status 404
        end
      end
    end
  end

  patch 'web_api/v1/permissions_custom_fields/:id/reorder' do
    with_options scope: :permissions_custom_field do
      parameter :ordering, 'The position, starting from 0, where the permissions field should be at. Fields after will move down.', required: true
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end

    context 'fields already exist' do
      let(:permission) { create(:permission, action: 'commenting_idea', permitted_by: 'users', custom_fields_behavior: 'custom') }
      let!(:permission_custom_fields) { create_list(:permissions_custom_field, 4, permission: permission) }

      context 'All fields are already persisted' do
        let(:id) { permission_custom_fields.last.id }
        let(:ordering) { 1 }

        example 'Reorder a permissions field' do
          expect(permission_custom_fields.last.ordering).to eq 3

          do_request
          expect(response_status).to eq 200
          expect(response_data.dig(:attributes, :ordering)).to match ordering
          expect(PermissionsCustomField.order(:ordering)[1].id).to eq id
          expect(PermissionsCustomField.order(:ordering).pluck(:ordering)).to eq (0..3).to_a
        end
      end

      context 'Fields are persisted exist and then group is added' do
        let(:group_field) { create(:custom_field_domicile, enabled: false) }
        let(:custom_field_id) { group_field.id }
        let(:permission_id) { permission.id }
        let(:ordering) { 1 }

        example 'Reorder a non-persisted group field when all other fields are already persisted' do
          group = create(:smart_group, rules: [
            { ruleType: 'custom_field_select', customFieldId: group_field.id, predicate: 'is_empty' }
          ])
          permission.groups << group
          fields = Permissions::PermissionsCustomFieldsService.new.fields_for_permission(permission)

          expect(PermissionsCustomField.count).to eq 4
          expect(fields.last.custom_field.code).to eq 'domicile'
          expect(fields.last.ordering).to eq 4

          do_request
          expect(response_status).to eq 200
          expect(response_data.dig(:attributes, :ordering)).to match ordering
          expect(PermissionsCustomField.count).to eq 5
        end
      end
    end
  end

  delete 'web_api/v1/permissions_custom_fields/:id' do
    with_options scope: :permissions_custom_field do
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end

    context 'fields already exist' do
      let(:permissions_custom_field) { create(:permissions_custom_field, permission: permission) }
      let(:id) { permissions_custom_field.id }

      example_request 'Delete a permissions custom field' do
        assert_status 200
        expect { PermissionsCustomField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
