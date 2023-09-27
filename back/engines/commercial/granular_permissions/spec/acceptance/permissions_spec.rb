# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Permissions' do
  explanation 'These determine who (e.g. groups) can take which actions (e.g. posting, reacting) in a participation context'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:continuous_project)
    @phase = ParticipationContextService.new.get_participation_context(create(:project_with_current_phase))
    PermissionsService.new.update_all_permissions
  end

  let(:project_id) { @project.id }
  let(:phase_id) { @phase.id }

  context 'when admin' do
    before { admin_header_token }

    get 'web_api/v1/projects/:project_id/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all permissions of a project' do
        assert_status 200
        expect(response_data.size).to eq Permission.enabled_actions(@project).size
      end

      example 'List all permissions of a project when reacting has been disabled' do
        @project.update!(reacting_enabled: false)

        do_request
        assert_status 200
        expect(response_data.size).to eq Permission.enabled_actions(@project).size
      end

      example_request 'List all permissions efficiently include custom fields', document: true do
        permission = @project.permissions.first
        field2 = create(:custom_field)
        field1 = create(:custom_field)
        field3 = create(:custom_field)
        field1.move_to_top
        field2.reload
        field3.reload
        permission.permissions_custom_fields.create!(custom_field: field2, required: true)
        permission.permissions_custom_fields.create!(custom_field: field1, required: false)
        permission.permissions_custom_fields.create!(custom_field: field3, required: true)

        expect do
          do_request
        end.not_to exceed_query_limit(1).with(/SELECT.*custom_fields/)

        assert_status 200
        json_response = json_parse response_body
        permission_data = json_response[:data].find { |d| d[:id] == permission.id }
        ordered_permissions_custom_field_ids = permission.permissions_custom_fields.sort_by do |permissions_custom_field|
          permissions_custom_field.custom_field.ordering
        end.map(&:id)
        expect(permission_data.dig(:relationships, :custom_fields)).to eq(
          { data: [field1, field2, field3].map { |field| { id: field.id, type: 'custom_field' } } }
        )
        expect(permission_data.dig(:relationships, :permissions_custom_fields)).to eq(
          { data: ordered_permissions_custom_field_ids.map { |id| { id: id, type: 'permissions_custom_field' } } }
        )
        [field1, field2, field3].each do |field|
          included_field = json_response[:included].find { |d| d[:id] == field.id }
          expect(included_field[:attributes]).to include(
            ordering: field.ordering,
            required: field.required
          )
        end
        permission.permissions_custom_fields.each do |permissions_custom_field|
          included_permissions_custom_field = json_response[:included].find { |d| d[:id] == permissions_custom_field.id }
          expect(included_permissions_custom_field[:attributes]).to include(
            required: permissions_custom_field.required
          )
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all permissions of a phase' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq Permission.available_actions(@phase).size
      end
    end

    get 'web_api/v1/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all global permissions' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq Permission.available_actions(nil).size
      end
    end

    get 'web_api/v1/projects/:project_id/permissions/:action' do
      let(:action) { @project.permissions.first.action }

      example_request 'Get one permission by action' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :id)).to eq @project.permissions.first.id
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action' do
      let(:action) { @phase.permissions.first.action }

      example_request 'Get one permission by action' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @phase.permissions.first.id
      end
    end

    get 'web_api/v1/permissions/:action' do
      let(:action) { 'posting_initiative' }

      example_request 'Get one global permission by action' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :id)).to eq Permission.find_by!(permission_scope: nil, action: action).id
      end
    end

    patch 'web_api/v1/projects/:project_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :global_custom_fields, 'When set to true, the enabled registrations are associated to the permission', required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @project.permissions.first.action }
      let(:permitted_by) { 'groups' }
      let(:global_custom_fields) { true }
      let(:group_ids) { create_list(:group, 3, projects: [@project]).map(&:id) }

      example_request 'Update a permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :attributes, :global_custom_fields)).to eq global_custom_fields
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :global_custom_fields, 'When set to true, the enabled registrations are associated to the permission', required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @phase.permissions.first.action }
      let(:permitted_by) { 'groups' }
      let(:group_ids) { create_list(:group, 3, projects: [@phase.project]).map(&:id) }

      example_request 'Update a permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end

    patch 'web_api/v1/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :global_custom_fields, 'When set to true, the enabled registrations are associated to the permission', required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { 'reacting_initiative' }
      let(:permitted_by) { 'groups' }
      let(:group_ids) { create_list(:group, 3).map(&:id) }

      example_request 'Update a global permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end
    end
  end

  context 'when resident' do
    before do
      @user = create(:user)
      header_token_for @user
    end

    get 'web_api/v1/projects/:project_id/permissions/:action/participation_conditions' do
      before do
        @rule = { 'ruleType' => 'email', 'predicate' => 'ends_on', 'value' => 'test.com' }
        @groups = [create(:group), create(:smart_group, rules: [@rule])]
        @permission = @project.permissions.first
        @permission.update!(permitted_by: 'groups', groups: @groups)
      end

      let(:action) { @permission.action }

      example_request 'Get the participation conditions of a user' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :participation_conditions)).to eq [[SmartGroups::RulesService.new.parse_json_rule(@rule).description_multiloc.symbolize_keys]]
      end
    end

    get 'web_api/v1/projects/:project_id/permissions/:action/requirements' do
      before do
        @permission = @project.permissions.first
        @permission.update!(permitted_by: 'everyone')
      end

      let(:action) { @permission.action }

      example_request 'Get the participation requirements of a user in a continuous project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :requirements)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {},
            onboarding: { topics_and_areas: 'dont_ask' },
            special: {
              password: 'satisfied',
              confirmation: 'satisfied',
              verification: 'dont_ask',
              group_membership: 'dont_ask'
            }
          }
        })
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/requirements' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
        @permission = @phase.permissions.first
        @permission.update!(permitted_by: 'everyone_confirmed_email')
        create(:custom_field_birthyear, required: true)
        create(:custom_field_gender, required: false)
        create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_field')

        @user.reset_confirmation_and_counts
        @user.update!(
          first_name: 'Jack',
          last_name: nil,
          password_digest: nil,
          custom_field_values: { 'gender' => 'male' }
        )
      end

      let(:action) { @permission.action }

      # NOTE: Custom fields requirements will be {} as they are set globally - which are not allowed for everyone_confirmed_email
      example_request 'Get the participation requirements of a passwordless user requiring confirmation in a timeline phase' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :requirements)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'dont_ask',
              email: 'satisfied'
            },
            custom_fields: {},
            onboarding: { topics_and_areas: 'dont_ask' },
            special: {
              password: 'dont_ask',
              confirmation: 'require',
              verification: 'dont_ask',
              group_membership: 'dont_ask'
            }
          }
        })
      end
    end

    get 'web_api/v1/permissions/:action/requirements' do
      before do
        @permission = Permission.where(permission_scope_type: nil).first
        @permission.update!(permitted_by: 'everyone')
      end

      let(:action) { @permission.action }

      example_request 'Get the participation requirements of a user in the global scope' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :requirements)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {},
            onboarding: { topics_and_areas: 'dont_ask' },
            special: {
              password: 'satisfied',
              confirmation: 'satisfied',
              verification: 'dont_ask',
              group_membership: 'dont_ask'
            }
          }
        })
      end
    end

    get 'web_api/v1/permissions/:action/requirements' do
      before do
        create(:custom_field_birthyear, required: true)
        create(:custom_field_gender, required: false)
        create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_field')
        create(:custom_field, resource_type: 'User', enabled: false, key: 'disabled_field') # Should not be returned

        @user.update!(
          email: 'my@email.com',
          first_name: 'Jack',
          last_name: nil,
          password_digest: nil,
          custom_field_values: { 'gender' => 'male' }
        )

        create(:topic, include_in_onboarding: true)
      end

      let(:action) { 'visiting' }

      example_request 'Get the global registration requirements when custom fields are asked' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :requirements)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'require',
              email: 'satisfied'
            },
            custom_fields: {
              birthyear: 'require',
              gender: 'satisfied',
              extra_field: 'require'
            },
            onboarding: { topics_and_areas: 'ask' },
            special: {
              password: 'require',
              confirmation: 'satisfied',
              verification: 'dont_ask',
              group_membership: 'dont_ask'
            }
          }
        })
      end
    end

    get 'web_api/v1/ideas/:idea_id/permissions/:action/requirements' do
      before do
        @permission = @project.permissions.first
        @permission.update!(permitted_by: 'users')

        create(:topic, include_in_onboarding: true)
      end

      let(:action) { @permission.action }
      let(:idea) { create(:idea, project: @project) }
      let(:idea_id) { idea.id }

      example_request 'Get the participation requirements of a user in an idea' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :requirements)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {},
            onboarding: { topics_and_areas: 'ask' },
            special: {
              password: 'satisfied',
              confirmation: 'satisfied',
              verification: 'dont_ask',
              group_membership: 'dont_ask'
            }
          }
        })
      end
    end

    get 'web_api/v1/permissions/:action/schema' do
      before do
        @permission = Permission.find_by permission_scope_type: nil, action: 'visiting'
        @field1 = create(:custom_field, required: true)
        @field2 = create(:custom_field, required: false)
      end

      let(:action) { 'visiting' }

      example_request 'Get the json and ui schema for a global permission with custom fields' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc][:en]).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            @field1.key.to_sym => { type: 'string' },
            @field2.key.to_sym => { type: 'string' }
          },
          required: [@field1.key]
        })
        expect(json_attributes[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/projects/:project_id/permissions/:action/schema' do
      before do
        @permission = @project.permissions.first
        @permission.update!(global_custom_fields: false)
        @field1 = create(:custom_field, required: true, enabled: false) # Field should be returned even if not enabled globally
        @field2 = create(:custom_field, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field1, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field2, required: true)
      end

      let(:action) { @permission.action }
      let(:project_id) { @project.id }

      example_request 'Get the json and ui schema for a project permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc][:en]).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            @field1.key.to_sym => { type: 'string' },
            @field2.key.to_sym => { type: 'string' }
          },
          required: [@field2.key]
        })
        expect(json_attributes[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/ideas/:idea_id/permissions/:action/schema' do
      before do
        @permission = @project.permissions.first
        @permission.update!(global_custom_fields: false)
        @field1 = create(:custom_field, required: true)
        @field2 = create(:custom_field, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field1, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field2, required: true)
      end

      let(:action) { @permission.action }
      let(:idea) { create(:idea, project: @project) }
      let(:idea_id) { idea.id }

      example_request 'Get the json and ui schema for an idea permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc][:en]).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            @field1.key.to_sym => { type: 'string' },
            @field2.key.to_sym => { type: 'string' }
          },
          required: [@field2.key]
        })
        expect(json_attributes[:ui_schema_multiloc]).to be_present
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/schema' do
      before do
        @permission = @phase.permissions.first
        @permission.update!(global_custom_fields: false)
        @field1 = create(:custom_field, required: true)
        @field2 = create(:custom_field, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field1, required: false)
        create(:permissions_custom_field, permission: @permission, custom_field: @field2, required: true)
      end

      let(:action) { @permission.action }
      let(:idea_id) { @phase.id }

      example_request 'Get the json and ui schema for a phase permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'schema'
        json_attributes = json_response.dig(:data, :attributes)
        expect(json_attributes[:json_schema_multiloc][:en]).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            @field1.key.to_sym => { type: 'string' },
            @field2.key.to_sym => { type: 'string' }
          },
          required: [@field2.key]
        })
        expect(json_attributes[:ui_schema_multiloc]).to be_present
      end
    end
  end
end
