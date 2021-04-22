# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ActionDescriptors' do
  explanation 'Describe which actions the current user is allowed to take.'

  let(:json_response) { json_parse(response_body) }

  before do
    user_header_token
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/action_descriptors/initiatives' do

    example_request 'Get the global action descriptors for initiatives' do
      expect(response_status).to eq 200
      expect(json_response.values.pluck(:enabled).all?).to eq true
      expect(json_response.values.pluck(:disabled_reason).none?).to eq true
    end

    context 'with granular permissions enabled', document: false, skip: !CitizenLab.ee? do

      # rubocop:disable RSpec/BeforeAfterAll
      before(:all) do
        @cached_scope_types = PermissionsService.instance_variable_get(:@scope_spec_hash)
        PermissionsService.clear_scope_types
        PermissionsService.register_scope_type(CitizenLab::Permissions::ScopeTypes::Global)
      end

      after(:all) do
        # Restore registered scope-types as they were before the tests.
        PermissionsService.instance_variable_set(:@scope_spec_hash, @cached_scope_types)
      end
      # rubocop:enable RSpec/BeforeAfterAll

      before do
        PermissionsService.new.update_all_permissions
        Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
                  .update!(permitted_by: 'groups', groups: create_list(:group, 2))
      end

      example_request 'Get the global action descriptors for initiatives' do
        json_response = json_parse(response_body)
        expect(json_response).to eq(
          {
            posting_initiative: {
              enabled: true,
              disabled_reason: nil
            },
            commenting_initiative: {
              enabled: false,
              disabled_reason: 'not_permitted'
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
              disabled_reason: 'not_permitted'
            }
          }
        )
      end
    end
  end
end
