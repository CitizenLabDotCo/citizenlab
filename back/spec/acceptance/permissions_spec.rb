# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Permissions' do
  explanation 'These determine who (e.g. groups) can take which actions (e.g. posting, reacting) in a participation context'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:single_phase_ideation_project)
    @phase = TimelineService.new.current_phase_not_archived(@project)
    Permissions::PermissionsUpdateService.new.update_all_permissions
    SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
  end

  let(:project_id) { @project.id }
  let(:phase_id) { @phase.id }

  context 'when admin' do
    before { admin_header_token }

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

      example 'List all permissions of a phase when reacting has been disabled' do
        @phase.update!(reacting_enabled: false)

        do_request
        assert_status 200
        expect(response_data.size).to eq Permission.enabled_actions(@phase).size
      end

      example_request 'List all permissions efficiently include custom fields', document: true do
        permission = @phase.permissions.first
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
        end.not_to exceed_query_limit(2).with(/SELECT.*custom_fields/)

        assert_status 200
        json_response = json_parse response_body
        permission_data = json_response[:data].find { |d| d[:id] == permission.id }
        ordered_permissions_custom_field_ids = permission.permissions_custom_fields.pluck(:id)

        expect(permission_data.dig(:relationships, :custom_fields)).to eq(
          { data: [field2, field1, field3].map { |field| { id: field.id, type: 'custom_field' } } }
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

    get 'web_api/v1/permissions' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of permissions per page'
      end

      example_request 'List all global permissions' do
        assert_status 200
        expect(response_data.size).to eq 3
        expect(response_data.map { |d| d.dig(:attributes, :action) }).to match_array Permission.available_actions(nil)
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action' do
      let(:action) { @phase.permissions.first.action }

      context 'with custom fields and groups' do
        before do
          create(:custom_field_gender, enabled: true, required: true)
          @phase.permissions.first.update!(group_ids: create_list(:group, 2, projects: [@phase.project]).map(&:id), global_custom_fields: true)
        end

        example_request 'Get one permission by action' do
          expect(status).to eq 200
          expect(response_data[:id]).to eq @phase.permissions.first.id
          expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array Group.all.pluck(:id)
          # TODO: JS - Default Permissions fields will not be returned as relationships - are they needed?
        end

        example 'Get one group permission', document: false do
          @phase.permissions.first.update!(permitted_by: 'users')

          do_request
          expect(status).to eq 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
          expect(response_data.dig(:relationships, :groups, :data).count).to eq 2
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array Group.all.pluck(:id)
        end
      end
    end

    get 'web_api/v1/permissions/:action' do
      let(:action) { 'attending_event' }

      example_request 'Get one global permission by action' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :id)).to eq Permission.find_by!(permission_scope: nil, action: action).id
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :global_custom_fields, 'When set to true, the enabled registrations are associated to the permission', required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
        parameter :verification_expiry, 'number of days before reverification required - nil means never reverify', required: false
        parameter :access_denied_explanation_multiloc, 'Multiloc string for explaining why access is denied', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @phase.permissions.first.action }
      let(:group_ids) { create_list(:group, 3, projects: [@phase.project]).map(&:id) }
      let(:access_denied_explanation_multiloc) { { en: 'You do not have access because you are not in the right group' } }

      context 'permitted_by: verified' do
        let(:permitted_by) { 'verified' }
        let(:verification_expiry) { 30 }

        example_request 'Update a permission with verified permitted_by' do
          assert_status 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq permitted_by
          expect(response_data.dig(:attributes, :verification_expiry)).to eq verification_expiry
          expect(response_data.dig(:attributes, :verification_enabled)).to be true
          expect(response_data.dig(:attributes, :access_denied_explanation_multiloc)).to eq access_denied_explanation_multiloc
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids
        end
      end

      context 'permitted_by: everyone_confirmed_email' do
        let(:permitted_by) { 'everyone_confirmed_email' }

        example_request 'Update group IDs when permitted_by "everyone_confirmed_email"' do
          assert_status 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq permitted_by
          expect(response_data.dig(:attributes, :access_denied_explanation_multiloc)).to eq access_denied_explanation_multiloc
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids
        end
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action/reset' do
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:permission) { @phase.permissions.first }
      let(:action) { @phase.permissions.first.action }

      example 'Reset a permission to use global custom fields and no groups' do
        # Create some groups & permission fields
        permission.update!(global_custom_fields: false)
        create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field), required: true)
        permission.groups << create_list(:group, 2, projects: [@phase.project])

        # Check the setup is correct
        expect(permission.permissions_custom_fields.count).to eq 1
        expect(permission.groups.count).to eq 2

        do_request
        assert_status 200
        expect(response_data.dig(:attributes, :global_custom_fields)).to be true
        expect(permission.permissions_custom_fields.count).to eq 0
        expect(permission.permissions_custom_fields.count).to eq 0
      end
    end

    patch 'web_api/v1/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :global_custom_fields, 'When set to true, the enabled registrations are associated to the permission', required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { 'attending_event' }
      let(:permitted_by) { 'users' }
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

    get 'web_api/v1/phases/:phase_id/permissions/:action/requirements' do
      context "'everyone' permissions" do
        before do
          @permission = @phase.permissions.first
          @permission.update!(permitted_by: 'everyone')
        end

        let(:action) { @permission.action }

        example_request 'Get the participation requirements of a user in a phase' do
          assert_status 200
          expect(response_data[:attributes]).to eq({
            permitted: true,
            disabled_reason: nil,
            requirements: {
              authentication: {
                permitted_by: 'everyone',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: false,
              group_membership: false
            }
          })
        end
      end

      context "'everyone_confirmed_email' permissions" do
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
        example_request 'Get the participation requirements of a passwordless user requiring confirmation in a phase' do
          assert_status 200
          expect(response_data[:attributes]).to eq({
            permitted: false,
            disabled_reason: 'user_missing_requirements',
            requirements: {
              authentication: {
                permitted_by: 'everyone_confirmed_email',
                missing_user_attributes: ['confirmation']
              },
              verification: false,
              custom_fields: {},
              onboarding: false,
              group_membership: false
            }
          })
        end
      end
    end

    get 'web_api/v1/permissions/:action/requirements' do
      context 'with everyone permission' do
        before do
          @permission = Permission.where(permission_scope_type: nil).first
          @permission.update!(permitted_by: 'everyone')
        end

        let(:action) { @permission.action }

        example_request 'Get the participation requirements of a user in the global scope' do
          assert_status 200
          expect(response_data[:attributes]).to eq({
            permitted: true,
            disabled_reason: nil,
            requirements: {
              authentication: {
                permitted_by: 'everyone',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: false,
              group_membership: false
            }
          })
        end
      end
    end

    get 'web_api/v1/permissions/:action/requirements' do
      context 'with custom fields and onboarding' do
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
          expect(response_data[:attributes]).to eq({
            permitted: false,
            disabled_reason: 'user_missing_requirements',
            requirements: {
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: %w[last_name password]
              },
              verification: false,
              custom_fields: {
                birthyear: 'required',
                extra_field: 'required'
              },
              onboarding: true,
              group_membership: false
            }
          })
        end
      end
    end

    get 'web_api/v1/ideas/:idea_id/permissions/:action/requirements' do
      context 'with user permission and onboarding' do
        before do
          @permission = @phase.permissions.first
          @permission.update!(permitted_by: 'users')

          create(:topic, include_in_onboarding: true)
        end

        let(:action) { @permission.action }
        let(:idea) { create(:idea, project: @project) }
        let(:idea_id) { idea.id }

        example_request 'Get the participation requirements of a user in an idea' do
          assert_status 200
          expect(response_data[:attributes]).to eq({
            permitted: true,
            disabled_reason: nil,
            requirements: {
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: []
              },
              verification: false,
              custom_fields: {},
              onboarding: true,
              group_membership: false
            }
          })
        end
      end
    end

    get 'web_api/v1/permissions/:action/custom_fields' do
      let(:action) { 'visiting' }

      context 'without verification' do
        before do
          @permission = Permission.find_by permission_scope_type: nil, action: 'visiting'
          @field1 = create(:custom_field, required: true)
          @field2 = create(:custom_field, required: false)
        end

        example_request 'Get the custom fields for a global permission' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data]).to be_an(Array)
          expect(json_response[:data].size).to eq 2

          field_codes = json_response[:data].map { |field| field.dig(:attributes, :code) }
          expect(field_codes).to include(@field1.code, @field2.code)

          # Check that custom fields have the expected attributes
          field1_data = json_response[:data].find { |field| field.dig(:attributes, :code) == @field1.code }
          expect(field1_data[:type]).to eq 'custom_field'
          expect(field1_data[:attributes]).to include(
            code: @field1.code,
            input_type: @field1.input_type,
            required: @field1.required,
            enabled: true
          )
        end
      end

      context 'with fields locked by verification' do
        before do
          create(:custom_field_gender, required: false)
          Permissions::PermissionsUpdateService.new.update_all_permissions

          user = create(:user)
          create(:verification, method_name: 'bogus', user: user) # Bogus locks the `gender` custom_field

          header 'Content-Type', 'application/json'
          header_token_for user
        end

        example_request 'Locked fields have constraints in custom fields response' do
          assert_status 200
          json_response = json_parse response_body

          gender_field = json_response[:data].find { |field| field.dig(:attributes, :code) == 'gender' }
          expect(gender_field).to be_present
          expect(gender_field[:attributes][:constraints]).to eq({ locked: true })
        end
      end
    end

    get 'web_api/v1/permissions/:action/custom_field_options' do
      let(:action) { 'visiting' }

      context 'without verification' do
        before do
          @permission = Permission.find_by permission_scope_type: nil, action: 'visiting'
          @field1 = create(:custom_field_select, required: true)
          @field2 = create(:custom_field_select, required: false)
          create_list(:custom_field_option, 3, custom_field: @field1)
          create_list(:custom_field_option, 2, custom_field: @field2)

          # Reorder one option to test ordering
          @reordered_option = @field1.reload.options.last
          @reordered_option.insert_at(1)
        end

        example_request 'Get the custom fields for a global permission' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data]).to be_an(Array)
          expect(json_response[:data].size).to eq 5

          # Test ordering
          expect(json_response[:data][1][:id]).to eq @reordered_option.id
        end
      end
    end

    get 'web_api/v1/ideas/:idea_id/permissions/:action/custom_fields' do
      context 'with permission-specific custom fields' do
        before do
          @permission = @project.phases.first.permissions.first
          @permission.update!(global_custom_fields: false)
          @field1 = create(:custom_field, required: true)
          @field2 = create(:custom_field, required: false)
          create(:permissions_custom_field, permission: @permission, custom_field: @field1, required: false)
          create(:permissions_custom_field, permission: @permission, custom_field: @field2, required: true)
        end

        let(:action) { @permission.action }
        let(:idea) { create(:idea, project: @project, phases: @project.phases) }
        let(:idea_id) { idea.id }

        example_request 'Get the custom fields for an idea permission' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data]).to be_an(Array)
          expect(json_response[:data].size).to eq 2

          field_codes = json_response[:data].map { |field| field.dig(:attributes, :code) }
          expect(field_codes).to include(@field1.code, @field2.code)

          # Check that custom fields are returned with basic attributes
          field1_data = json_response[:data].find { |field| field.dig(:attributes, :code) == @field1.code }
          field2_data = json_response[:data].find { |field| field.dig(:attributes, :code) == @field2.code }
          expect(field1_data[:type]).to eq 'custom_field'
          expect(field2_data[:type]).to eq 'custom_field'
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/custom_fields' do
      context 'with permission-specific custom fields' do
        before do
          @permission = @phase.permissions.first
          @permission.update!(global_custom_fields: false)
          @field1 = create(:custom_field, required: true)
          @field2 = create(:custom_field, required: false)
          create(:permissions_custom_field, permission: @permission, custom_field: @field1, required: false)
          create(:permissions_custom_field, permission: @permission, custom_field: @field2, required: true)
        end

        let(:action) { @permission.action }
        let(:phase_id) { @phase.id }

        example_request 'Get the custom fields for a phase permission' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data]).to be_an(Array)
          expect(json_response[:data].size).to eq 2

          field_codes = json_response[:data].map { |field| field.dig(:attributes, :code) }
          expect(field_codes).to include(@field1.code, @field2.code)

          # Check that custom fields are returned with basic attributes
          field1_data = json_response[:data].find { |field| field.dig(:attributes, :code) == @field1.code }
          field2_data = json_response[:data].find { |field| field.dig(:attributes, :code) == @field2.code }
          expect(field1_data[:type]).to eq 'custom_field'
          expect(field2_data[:type]).to eq 'custom_field'
        end
      end
    end

    get 'web_api/v1/phases/:phase_id/permissions/:action/access_denied_explanation' do
      context 'with access denied explanation' do
        before do
          @permission = @phase.permissions.first
          @multiloc = { en: '<p>You do not have access because you are not in the right group</p>' }
          @permission.update!(access_denied_explanation_multiloc: @multiloc)
        end

        let(:action) { @permission.action }

        example_request 'Get the access denied explanation of a phase permission' do
          assert_status 200
          expect(response_data[:attributes][:access_denied_explanation_multiloc]).to eq(@multiloc)
        end
      end
    end
  end
end
