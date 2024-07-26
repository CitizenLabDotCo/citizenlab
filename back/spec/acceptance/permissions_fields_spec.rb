# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PermissionsField' do
  explanation 'Associations between permissions and registration fields that should be specified to be granted permission.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  let(:permission_scope) { nil }
  let(:action) { 'visiting' }
  let(:permitted_by) { 'users' }
  let(:permission) { create(:permission, permission_scope: permission_scope, action: action, permitted_by: permitted_by) }

  get 'web_api/v1/ideas/:idea_id/permissions/:action/permissions_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of permissions fields per page'
    end

    let(:project) { create(:single_phase_ideation_project) }
    let(:permission_scope) { project.phases.first }
    let(:action) { 'commenting_idea' }
    let(:idea_id) { create(:idea, project: project).id }

    context 'feature flag "verified_actions" is NOT enabled' do
      example 'List all permissions fields of a permission' do
        field1, field2 = create_list(:custom_field, 2)
        [{ required: true, custom_field: field1 }, { required: false, custom_field: field2 }].each do |attributes|
          create(:permissions_field, attributes.merge(permission: permission))
        end

        do_request

        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true, false]
        expect(response_data.map { |d| d.dig(:relationships, :custom_field) }).to eq([
          { data: { id: field1.id, type: 'custom_field' } },
          { data: { id: field2.id, type: 'custom_field' } }
        ])
      end
    end

    context 'feature flag "verified_actions" is enabled' do
      before do
        SettingsService.new.activate_feature! 'verified_actions'
        permission # Create permission
      end

      example 'List all default permissions fields of a "user" permission' do
        permission.update!(global_custom_fields: true)
        custom_field = create(:custom_field_gender, required: false, enabled: true)

        do_request

        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [false]
        expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to match_array [permission.id]
        expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
      end

      example 'List all persisted permissions fields and associated groups of a "user" permission' do
        permission.update!(global_custom_fields: false)

        # Permissions field not associated with any group
        create(:permissions_field, permission: permission, custom_field: create(:custom_field_gender))

        # Permissions field associated with one group
        custom_field = create(:custom_field_text, :for_registration, enabled: true, required: false)
        associated_group = create(:smart_group, slug: 'used', rules: [
          { ruleType: 'custom_field_text', customFieldId: custom_field.id, predicate: 'is', value: 'abc' }
        ])
        not_used_group = create(:smart_group, slug: 'not-used', rules: [
          { ruleType: 'custom_field_text', customFieldId: SecureRandom.uuid, predicate: 'is', value: 'xyz' }
        ])
        permission.groups << associated_group
        permission.groups << not_used_group
        create(:permissions_field, permission: permission, custom_field: custom_field)

        do_request

        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true, true]
        expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to match_array [permission.id, permission.id]
        expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
        expect(response_data.last.dig(:relationships, :groups, :data).count).to eq 1
        expect(response_data.last.dig(:relationships, :groups, :data).pluck(:id)).to include associated_group.id
        expect(response_data.last.dig(:relationships, :groups, :data).pluck(:id)).not_to include not_used_group.id
      end
    end
  end

  get 'web_api/v1/permissions_fields/:id' do
    let(:id) { create(:permissions_field).id }

    example_request 'Get one permissions custom fields by id' do
      assert_status 200

      expect(response_data[:id]).to eq id
      expect(response_data.dig(:attributes, :created_at)).to be_present
      expect(response_data[:attributes].keys).to match_array(%i[required ordering lock title_multiloc created_at updated_at persisted])
    end
  end

  post 'web_api/v1/permissions/:action/permissions_fields' do
    with_options scope: :permissions_field do
      parameter :required, 'Whether filling out the field is mandatory. Defaults to true'
      parameter :custom_field_id, 'The associated registration field', required: true
    end
    ValidationErrorHelper.new.error_fields self, PermissionsField

    let(:required) { false }
    let(:custom_field_id) { create(:custom_field, enabled: false).id }

    before do
      create(:custom_field_gender, enabled: true) # Create a default custom field
      permission # Create permission
    end

    example_request 'Create a new permission custom field association' do
      assert_status 201

      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships, :custom_field, :data, :id)).to eq custom_field_id
      expect(json_response.dig(:data, :attributes, :required)).to eq required
      expect(PermissionsField.all.count).to eq 2 # Default custom field persisted + new custom field
    end
  end

  patch 'web_api/v1/permissions_fields/:id' do
    with_options scope: :permissions_field do
      parameter :required, 'Whether filling out the field is mandatory'
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end
    ValidationErrorHelper.new.error_fields self, PermissionsField

    context 'fields already exist' do
      let(:permissions_field) { create(:permissions_field, permission: permission, custom_field: create(:custom_field_gender)) }
      let(:id) { permissions_field.id }
      let(:required) { true }

      example_request 'Update a permissions custom field' do
        assert_status 200
        expect(response_data.dig(:attributes, :required)).to be true
      end
    end

    context 'no fields are yet persisted' do
      let(:permissions_field) { Permissions::PermissionsFieldsService.new.fields_for_permission(permission).first }
      let(:id) { permissions_field.id }
      let(:required) { true }

      before do
        permission.update!(global_custom_fields: true)
        create(:custom_field_gender, enabled: true) # Create a default custom field
      end

      context 'permission and custom field IDs are provided' do
        let(:custom_field_id) { permissions_field.custom_field_id }
        let(:permission_id) { permission.id }

        example_request 'Persist default fields and update a permissions field' do
          assert_status 200
          expect(response_data.dig(:attributes, :required)).to be true
          expect(response_data[:id]).not_to eq id # New field created by persisting defaults so ID will change
          expect(response_data.dig(:relationships, :custom_field, :data, :id)).to eq custom_field_id
        end
      end

      context 'permission and custom field IDs are NOT provided' do
        example_request '[ERROR] permission not found' do
          assert_status 404
        end
      end
    end
  end

  patch 'web_api/v1/permissions_fields/:id/reorder' do
    with_options scope: :permissions_field do
      parameter :ordering, 'The position, starting from 0, where the permissions field should be at. Fields after will move down.', required: true
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end

    context 'fields already exist' do
      before do
        permission = create(:permission, action: 'commenting_idea', permitted_by: 'users')
        @permissions_fields = create_list(:permissions_field, 4, permission: permission)
      end

      let(:permissions_field) { create(:permissions_field, required: false) }
      let(:id) { @permissions_fields.last.id }
      let(:ordering) { 1 }

      example 'Reorder a permissions field' do
        expect(@permissions_fields.last.ordering).to eq 3

        do_request
        expect(response_status).to eq 200
        expect(response_data.dig(:attributes, :ordering)).to match ordering
        expect(PermissionsField.order(:ordering)[1].id).to eq id
        expect(PermissionsField.order(:ordering).pluck(:ordering)).to eq (0..3).to_a
      end
    end

    context 'fields are not yet persisted' do
      let(:permission) { create(:permission, permitted_by: 'users') }
      let(:permissions_field) { Permissions::PermissionsFieldsService.new.fields_for_permission(permission).last }
      let(:id) { permissions_field.id }
      let(:custom_field_id) { permissions_field.custom_field_id }
      let(:permission_id) { permission.id }
      let(:ordering) { 1 }

      before do
        # Create a default custom fields
        create(:custom_field_gender, enabled: true)
        create(:custom_field_birthyear, enabled: true)
        create(:custom_field_domicile, enabled: true)
      end

      example_request 'Persist default fields and reorder a permissions field' do
        assert_status 200
        expect(response_data[:id]).not_to eq id # New field created by persisting defaults so ID will change
        expect(response_data.dig(:relationships, :custom_field, :data, :id)).to eq custom_field_id
        expect(response_data.dig(:attributes, :ordering)).to match ordering
        expect(PermissionsField.order(:ordering)[1].id).to eq response_data[:id]
        expect(PermissionsField.order(:ordering).pluck(:ordering)).to eq (0..2).to_a
      end
    end

    # TODO: JS - only allow if not locked/hidden by verification
    # context 'Field cannot be reordered' do
    #   let(:id) { @permissions_fields.first.id }
    #   let(:ordering) { 3 }
    #
    #   example '[Error] Field cannot be reordered' do
    #     do_request
    #
    #     expect(response_status).to eq 422
    #     expect(json_response_body.dig(:errors, :permissions_field)).to eq [{ :error => 'only field types of custom_field can be reordered' }]
    #   end
    # end
  end

  delete 'web_api/v1/permissions_fields/:id' do
    with_options scope: :permissions_field do
      parameter :permission_id, 'Required if no fields are yet persisted'
      parameter :custom_field_id, 'Required if no fields are yet persisted'
    end

    context 'fields already exist' do
      let(:permissions_field) { create(:permissions_field) }
      let(:id) { permissions_field.id }

      example_request 'Delete a permissions custom field' do
        assert_status 200
        expect { PermissionsField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'fields are not yet persisted' do
      let(:permission) { create(:permission, permitted_by: 'users') }
      let(:permissions_field) { Permissions::PermissionsFieldsService.new.fields_for_permission(permission).last }
      let(:id) { permissions_field.id }
      let(:custom_field_id) { permissions_field.custom_field_id }
      let(:permission_id) { permission.id }

      before do
        # Create a default custom fields
        create(:custom_field_gender, enabled: true)
        create(:custom_field_birthyear, enabled: true)
        create(:custom_field_domicile, enabled: true) # To delete
      end

      example 'Persist default fields and then delete one' do
        # Check the setup
        expect(CustomField.all.count).to eq 3
        expect(PermissionsField.all.count).to eq 0
        expect(Permissions::PermissionsFieldsService.new.fields_for_permission(permission).count).to eq 3

        do_request
        assert_status 200
        expect(CustomField.all.count).to eq 3
        expect(PermissionsField.all.count).to eq 2 # 3 persisted and then 1 deleted
        expect(Permissions::PermissionsFieldsService.new.fields_for_permission(permission.reload).count).to eq 2
        expect(PermissionsField.all.map { |field| field.custom_field.code }).not_to include 'domicile'
      end
    end
  end
end
