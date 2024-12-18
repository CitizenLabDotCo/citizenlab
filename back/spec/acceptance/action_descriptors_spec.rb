# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ActionDescriptors' do
  explanation 'Describe which actions the current user is allowed to take.'

  let(:json_response) { json_parse(response_body) }

  before do
    resident_header_token
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/action_descriptors/initiatives' do
    example_request 'Get the global action descriptors for initiatives' do
      assert_status 200
      expect(json_response.dig(:data, :type)).to eq 'initiatives'
      json_attributes = json_response.dig(:data, :attributes)
      expect(json_attributes.values.pluck(:enabled).all?).to be true
      expect(json_attributes.values.pluck(:disabled_reason).none?).to be true
    end

    context 'with permissions on a phase enabled', document: false do
      before do
        Permissions::PermissionsUpdateService.new.update_all_permissions
        Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
          .update!(permitted_by: 'users', groups: create_list(:group, 2))
      end
    end
  end
end
