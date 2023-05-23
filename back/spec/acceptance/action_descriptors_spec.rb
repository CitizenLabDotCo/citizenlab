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

    context 'with granular permissions enabled', document: false do
      before do
        PermissionsService.new.update_all_permissions
        Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
          .update!(permitted_by: 'groups', groups: create_list(:group, 2))
      end

      example_request 'Get the global action descriptors for initiatives' do
        expect(json_response).to eq(
          {
            data: {
              type: 'initiatives',
              attributes: {
                posting_initiative: {
                  enabled: true,
                  disabled_reason: nil
                },
                commenting_initiative: {
                  enabled: false,
                  disabled_reason: 'not_in_group'
                },
                voting_initiative: {
                  enabled: true,
                  disabled_reason: nil
                },
                cancelling_initiative_votes: {
                  enabled: true,
                  disabled_reason: nil
                },
                comment_voting_initiative: {
                  enabled: false,
                  disabled_reason: 'not_in_group'
                }
              }
            }
          }
        )
      end
    end
  end
end
