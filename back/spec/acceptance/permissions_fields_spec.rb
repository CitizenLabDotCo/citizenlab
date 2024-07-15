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

    context 'feature flag "custom_permitted_by" is NOT enabled' do
      example 'List all permissions fields of a permission' do
        field1, field2 = create_list(:custom_field, 2)
        [{ required: true, custom_field: field1 }, { required: false, custom_field: field2 }].each do |attributes|
          create(:permissions_field, attributes.merge(permission: permission))
        end

        do_request

        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true, false]
        expect(response_data.map { |d| d.dig(:attributes, :field_type) }).to eq %w[custom_field custom_field]
        expect(response_data.map { |d| d.dig(:relationships, :custom_field) }).to eq([
          { data: { id: field1.id, type: 'custom_field' } },
          { data: { id: field2.id, type: 'custom_field' } }
        ])
      end
    end

    context 'feature flag "custom_permitted_by" is enabled' do
      before { permission } # Create permission

      example 'List all default permissions fields of a "user" permission' do
        SettingsService.new.activate_feature! 'custom_permitted_by'
        custom_field = create(:custom_field_gender, required: false, enabled: true)

        do_request

        assert_status 200
        expect(response_data.size).to eq 3
        expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true, true, false]
        expect(response_data.map { |d| d.dig(:attributes, :field_type) }).to match_array %w[name email custom_field]
        expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to match_array [permission.id, permission.id, permission.id]
        expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
      end
    end
  end

  get 'web_api/v1/permissions_fields/:id' do
    let(:id) { create(:permissions_field).id }

    example_request 'Get one permissions custom fields by id' do
      assert_status 200

      expect(response_data[:id]).to eq id
      expect(response_data.dig(:attributes, :created_at)).to be_present
      expect(response_data[:attributes].keys).to match_array(%i[field_type required enabled config ordering locked title_multiloc created_at updated_at])
    end
  end

  post 'web_api/v1/permissions/:action/permissions_fields' do
    with_options scope: :permissions_field do
      parameter :required, 'Whether filling out the field is mandatory. Defaults to true'
      parameter :custom_field_id, 'The associated registration field', required: true
    end
    ValidationErrorHelper.new.error_fields self, PermissionsField

    let(:required) { false }
    let(:custom_field_id) { create(:custom_field).id }

    before { permission } # Create permission

    example_request 'Create a permission - custom field association' do
      assert_status 201

      json_response = json_parse response_body
      expect(json_response.dig(:data, :relationships, :custom_field, :data, :id)).to eq custom_field_id
      expect(json_response.dig(:data, :attributes, :required)).to eq required
    end
  end

  patch 'web_api/v1/permissions_fields/:id' do
    with_options scope: :permissions_field do
      parameter :required, 'Whether filling out the field is mandatory'
      parameter :enabled, 'Is this field enabled? Delete should be used instead field_type = "custom_field"'
      parameter :config, 'Configuration for the field - only allowed currently on field_type = "email"'
    end
    ValidationErrorHelper.new.error_fields self, PermissionsField

    let(:permissions_field) { create(:permissions_field, field_type: 'email', required: false, enabled: false, config: {password: true, confirmed: true}) }
    let(:id) { permissions_field.id }
    let(:required) { true }
    let(:enabled) { true }
    let(:config) { {password: false, confirmed: false} }

    example_request 'Update a permissions custom field' do
      assert_status 200
      expect(response_data.dig(:attributes, :required)).to be true
      expect(response_data.dig(:attributes, :enabled)).to be true
      expect(response_data.dig(:attributes, :config)).to eq config
    end
  end

  patch 'web_api/v1/permissions_fields/:id/reorder' do
    with_options scope: :permissions_field do
      parameter :ordering, 'The position, starting from 0, where the permissions field should be at. Fields after will move down.', required: true
    end

    before do
      permission = create(:permission, action: 'commenting_idea', permitted_by: 'custom')
      @permissions_fields =
        [create(:permissions_field, permission: permission, field_type: 'name')] +
        create_list(:permissions_field, 3, permission: permission)
    end

    let(:permissions_field) { create(:permissions_field, required: false) }

    context 'Field can be reordered' do
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

    context 'Field cannot be reordered' do
      let(:id) { @permissions_fields.first.id }
      let(:ordering) { 3 }

      example '[Error] Field cannot be reordered' do
        do_request

        expect(response_status).to eq 422
        expect(json_response_body.dig(:errors, :permissions_field)).to eq [{ :error => 'only field types of custom_field can be reordered' }]
      end
    end
  end

  delete 'web_api/v1/permissions_fields/:id' do
    let(:permissions_field) { create(:permissions_field) }
    let(:id) { permissions_field.id }
    example_request 'Delete a permissions custom field' do
      assert_status 200
      expect { PermissionsField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
