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
  let(:permission) { create(:permission, permission_scope: permission_scope, action: action) }

  get 'web_api/v1/ideas/:idea_id/permissions/:action/permissions_custom_fields' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of permissions custom fields per page'
    end

    let(:permission_scope) { create(:continuous_project) }
    let(:action) { 'commenting_idea' }
    let(:idea_id) { create(:idea, project: permission_scope).id }

    example 'List all permissions custom fields of a permission' do
      field1, field2 = create_list(:custom_field, 2)
      [{ required: true, custom_field: field1 }, { required: false, custom_field: field2 }].each do |attributes|
        create(:permissions_custom_field, attributes.merge(permission: permission))
      end

      do_request

      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].map { |d| d.dig(:attributes, :required) }).to eq [true, false]
      expect(json_response[:data].map { |d| d.dig(:relationships, :custom_field) }).to eq([
        { data: { id: field1.id, type: 'custom_field' } },
        { data: { id: field2.id, type: 'custom_field' } }
      ])
    end
  end

  get 'web_api/v1/permissions_custom_fields/:id' do
    let(:id) { create(:permissions_custom_field).id }

    example_request 'Get one permissions custom fields by id' do
      assert_status 200
      json_response = json_parse response_body

      expect(json_response.dig(:data, :id)).to eq id
      expect(json_response.dig(:data, :attributes, :created_at)).to be_present
    end
  end

  post 'web_api/v1/permissions/:action/permissions_custom_fields' do
    with_options scope: :permissions_custom_field do
      parameter :required, 'Whether filling out the field is mandatory. Defaults to true'
      parameter :custom_field_id, 'The associated registration field', required: true
    end
    ValidationErrorHelper.new.error_fields self, PermissionsCustomField

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

  patch 'web_api/v1/permissions_custom_fields/:id' do
    with_options scope: :permissions_custom_field do
      parameter :required, 'Whether filling out the field is mandatory'
    end
    ValidationErrorHelper.new.error_fields self, PermissionsCustomField

    let(:permissions_custom_field) { create(:permissions_custom_field, required: false) }
    let(:id) { permissions_custom_field.id }
    let(:required) { true }

    example_request 'Update a permissions custom field' do
      assert_status 200

      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :required)).to be true
    end
  end

  delete 'web_api/v1/permissions_custom_fields/:id' do
    let(:permissions_custom_field) { create(:permissions_custom_field) }
    let(:id) { permissions_custom_field.id }
    example_request 'Delete a permissions custom field' do
      assert_status 200
      expect { PermissionsCustomField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
