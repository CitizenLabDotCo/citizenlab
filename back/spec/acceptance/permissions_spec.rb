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
    # Most examples below configure the phase's permissions, which only exist
    # once the action has been overridden. The inherited state is covered
    # separately, in the 'when the action inherits the global permission' groups.
    override_permissions!(@phase)
    AppConfiguration.instance.settings['id_config'] = { allowed: true, enabled: true, id_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
    AppConfiguration.instance.save!
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
          @phase.permissions.first.update!(group_ids: create_list(:group, 2, projects: [@phase.project]).map(&:id), custom_fields_behavior: 'global')
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
      let(:action) { 'following' }

      example_request 'Get one global permission by action' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :id)).to eq Permission.find_by!(permission_scope: nil, action: action).id
      end

      context "for the 'attending_event' permission, which inherits the global 'visiting' one" do
        let(:action) { 'attending_event' }

        example_request 'Get the inherited global attending_event permission', document: false do
          assert_status 200
          expect(Permission.where(permission_scope: nil, action: action)).to be_empty
          expect(response_data[:attributes]).to include(action: 'attending_event', inherited: true)
        end
      end

      context 'for the visiting permission' do
        let(:action) { 'visiting' }

        before do
          Permission.find_by!(permission_scope: nil, action: 'visiting').update!(
            require_confirmed_phone_number: true,
            confirmed_phone_number_expiry: 30,
            group_ids: create_list(:group, 2).map(&:id)
          )
        end

        example_request 'Get the visiting permission' do
          assert_status 200
          expect(response_data[:id]).to eq Permission.find_by!(permission_scope: nil, action: 'visiting').id
          expect(response_data[:attributes]).to include(
            action: 'visiting',
            require_confirmed_email: true,
            require_confirmed_phone_number: true,
            confirmed_phone_number_expiry: 30,
            require_name: true,
            require_password: true,
            require_verification: false
          )
          expect(response_data.dig(:relationships, :groups, :data).count).to eq 2
        end
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :custom_fields_behavior, "Which demographic questions are asked, either #{Permission::CUSTOM_FIELDS_BEHAVIORS.join(',')}. 'custom' requires the permissions_custom_fields feature.", required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
        parameter :verification_expiry, 'number of days before reverification required - nil means never reverify', required: false
        parameter :require_confirmed_email, 'Whether a confirmed email is required to take this action', required: false
        parameter :confirmed_email_expiry, 'number of days before email reconfirmation required - nil means never reconfirm', required: false
        parameter :require_name, 'Whether a first and last name are required to take this action', required: false
        parameter :require_password, 'Whether a password is required to take this action', required: false
        parameter :require_verification, 'Whether identity verification is required to take this action', required: false
        parameter :require_confirmed_phone_number, 'Whether a confirmed phone number is required to take this action', required: false
        parameter :confirmed_phone_number_expiry, 'number of days before phone reconfirmation required - nil means never reconfirm', required: false
        parameter :access_denied_explanation_multiloc, 'Multiloc string for explaining why access is denied', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { @phase.permissions.first.action }
      let(:group_ids) { create_list(:group, 3, projects: [@phase.project]).map(&:id) }
      let(:access_denied_explanation_multiloc) { { en: 'You do not have access because you are not in the right group' } }

      context 'require_verification' do
        let(:permitted_by) { 'users' }
        let(:require_verification) { true }
        let(:verification_expiry) { 30 }

        example_request 'Update a permission to require verification' do
          assert_status 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
          expect(response_data.dig(:attributes, :require_verification)).to be true
          expect(response_data.dig(:attributes, :verification_expiry)).to eq verification_expiry
          expect(response_data.dig(:attributes, :verification_enabled)).to be true
          expect(response_data.dig(:attributes, :access_denied_explanation_multiloc)).to eq access_denied_explanation_multiloc
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids
        end
      end

      context 'custom_fields_behavior' do
        let(:permitted_by) { 'users' }
        let!(:platform_field) { create(:custom_field_gender, enabled: true) }

        example 'Customise the demographic questions, which starts from none' do
          do_request(permission: { custom_fields_behavior: 'custom' })

          assert_status 200
          expect(response_data.dig(:attributes, :custom_fields_behavior)).to eq 'custom'
          # The platform-wide questions are not copied onto the permission; the
          # admin picks the ones this action asks.
          expect(Permission.find(response_data[:id]).permissions_custom_fields).to be_empty
        end

        example 'Stop asking demographic questions' do
          do_request(permission: { custom_fields_behavior: 'disabled' })

          assert_status 200
          expect(response_data.dig(:attributes, :custom_fields_behavior)).to eq 'disabled'
          expect(Permission.find(response_data[:id]).permissions_custom_fields).to be_empty
        end

        example 'Switching away from custom keeps the questions, so that switching back restores them' do
          do_request(permission: { custom_fields_behavior: 'custom' })
          permission = Permission.find(response_data[:id])
          create(:permissions_custom_field, permission: permission, custom_field: platform_field)

          do_request(permission: { custom_fields_behavior: 'global' })

          assert_status 200
          expect(permission.reload.custom_fields_behavior).to eq 'global'
          expect(permission.permissions_custom_fields.pluck(:custom_field_id)).to eq [platform_field.id]
        end

        example '[error] Questions cannot be customised without the permissions_custom_fields feature' do
          SettingsService.new.deactivate_feature!('permissions_custom_fields')

          do_request(permission: { custom_fields_behavior: 'custom' })

          assert_status 401
          expect(@phase.permissions.first.reload.custom_fields_behavior).not_to eq 'custom'
        end
      end

      context 'require_confirmed_email only' do
        let(:permitted_by) { 'users' }
        let(:require_confirmed_email) { true }
        let(:require_name) { false }
        let(:require_password) { false }

        example_request 'Update group IDs for a users permission that only requires a confirmed email' do
          assert_status 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
          expect(response_data.dig(:attributes, :require_confirmed_email)).to be true
          expect(response_data.dig(:attributes, :require_name)).to be false
          expect(response_data.dig(:attributes, :require_password)).to be false
          expect(response_data.dig(:attributes, :access_denied_explanation_multiloc)).to eq access_denied_explanation_multiloc
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids
        end
      end

      context 'require_confirmed_phone_number' do
        include_context 'with sms feature enabled'

        let(:permitted_by) { 'users' }
        let(:require_confirmed_phone_number) { true }
        let(:confirmed_phone_number_expiry) { 30 }

        example_request 'Update a permission to require a confirmed phone number' do
          assert_status 200
          expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
          expect(response_data.dig(:attributes, :require_confirmed_phone_number)).to be true
          expect(response_data.dig(:attributes, :confirmed_phone_number_expiry)).to eq confirmed_phone_number_expiry
          expect(response_data.dig(:attributes, :access_denied_explanation_multiloc)).to eq access_denied_explanation_multiloc
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids
        end
      end

      context 'activity logging', document: false do
        let(:permitted_by) { 'admins_moderators' }

        example 'logs a "changed" and a "changed_permitted_by" activity' do
          expect { do_request }
            .to enqueue_job(LogActivityJob).with(an_instance_of(Permission), 'changed', anything, anything, anything)
            .and enqueue_job(LogActivityJob).with(an_instance_of(Permission), 'changed_permitted_by', anything, anything, anything)
        end
      end
    end

    context 'overriding an action that inherits the global visiting permission' do
      let(:visiting_permission) { Permission.find_by!(action: 'visiting', permission_scope: nil) }

      before do
        # Undo the blanket override of the outer setup: this endpoint only
        # applies to an action that still inherits.
        Permission.where(permission_scope: @phase).destroy_all
        visiting_permission.update!(require_name: false, require_password: false, require_verification: true)
      end

      patch 'web_api/v1/phases/:phase_id/permissions/:action/override' do
        let(:action) { 'posting_idea' }

        example_request 'Override a permission that inherits the global visiting permission' do
          assert_status 200
          expect(response_data.dig(:attributes, :inherited)).to be false
          expect(response_data.dig(:attributes, :require_name)).to be false
          expect(response_data.dig(:attributes, :require_password)).to be false
          expect(response_data.dig(:attributes, :require_verification)).to be true
          expect(Permission.find_by(action: 'posting_idea', permission_scope: @phase)).to be_present
        end

        example 'The overridden permission no longer follows the visiting permission', document: false do
          do_request
          visiting_permission.update!(require_name: true)

          permission = Permission.find_by!(action: 'posting_idea', permission_scope: @phase)
          expect(permission.require_name).to be false
        end

        example 'Overriding twice is a no-op', document: false do
          do_request
          expect { do_request }.not_to change(Permission, :count)
          assert_status 200
        end

        example 'Copies the groups of the visiting permission', document: false do
          groups = create_list(:group, 2)
          visiting_permission.update!(groups: groups)

          do_request
          assert_status 200
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array groups.map(&:id)
        end

        example '[error] Overriding an action the phase does not support', document: false do
          do_request(action: 'taking_survey')
          assert_status 404
        end

        example 'logs an "overridden" activity', document: false do
          expect { do_request }
            .to enqueue_job(LogActivityJob).with(an_instance_of(Permission), 'overridden', anything, anything, anything)
        end
      end
    end

    patch 'web_api/v1/phases/:phase_id/permissions/:action/inherit' do
      let(:action) { 'posting_idea' }
      let!(:permission) do
        Permission.find_by!(action: 'posting_idea', permission_scope: @phase).tap do |p|
          p.update!(permitted_by: 'admins_moderators', custom_fields_behavior: 'custom', groups: [create(:group)])
          create(:permissions_custom_field, permission: p, custom_field: create(:custom_field))
        end
      end

      example_request 'Revert a permission back to the global visiting permission' do
        assert_status 200
        expect(response_data.dig(:attributes, :inherited)).to be true
        expect(response_data.dig(:attributes, :permitted_by)).to eq 'users'
        expect(Permission.where(id: permission.id)).to be_empty
      end

      example 'Destroys the groups and demographic questions of the permission', document: false do
        do_request
        assert_status 200
        expect(GroupsPermission.where(permission_id: permission.id)).to be_empty
        expect(PermissionsCustomField.where(permission_id: permission.id)).to be_empty
      end

      example '[error] Reverting an action that already inherits', document: false do
        permission.destroy!

        do_request
        assert_status 404
      end

      example 'logs an "inherited" activity', document: false do
        expect { do_request }
          .to enqueue_job(LogActivityJob).with(anything, 'inherited', anything, anything, anything)
      end
    end

    context 'when the action inherits the global visiting permission' do
      before do
        Permission.where(permission_scope: @phase).destroy_all
        Permission.find_by!(action: 'visiting', permission_scope: nil)
          .update!(require_name: false, require_password: false)
      end

      get 'web_api/v1/phases/:phase_id/permissions' do
        example_request 'Lists the inherited permissions alongside the overridden ones' do
          assert_status 200
          expect(response_data.pluck(:id)).to all(be_blank)
          expect(response_data.map { |p| p.dig(:attributes, :action) })
            .to eq Permission.enabled_actions(@phase)
          expect(response_data.map { |p| p.dig(:attributes, :inherited) }).to all(be true)
          expect(response_data.map { |p| p.dig(:attributes, :require_name) }).to all(be false)
        end

        example 'Marks the overridden actions as not inherited', document: false do
          override_permissions!(@phase, actions: ['posting_idea'])

          do_request
          assert_status 200
          inherited_by_action = response_data.to_h { |p| [p.dig(:attributes, :action), p.dig(:attributes, :inherited)] }
          expect(inherited_by_action['posting_idea']).to be false
          expect(inherited_by_action['commenting_idea']).to be true
        end
      end

      get 'web_api/v1/phases/:phase_id/permissions/:action' do
        let(:action) { 'posting_idea' }

        example_request 'Get an inherited permission by action' do
          assert_status 200
          expect(response_data.dig(:attributes, :inherited)).to be true
          expect(response_data.dig(:attributes, :require_name)).to be false
        end
      end

      patch 'web_api/v1/phases/:phase_id/permissions/:action' do
        let(:action) { 'posting_idea' }
        let(:permitted_by) { 'admins_moderators' }

        example '[error] An inherited permission cannot be updated before it is overridden', document: false do
          do_request(permission: { permitted_by: permitted_by })
          assert_status 404
        end
      end
    end

    patch 'web_api/v1/permissions/:action' do
      with_options scope: :permission do
        parameter :permitted_by, "Defines who is granted permission, either #{Permission::PERMITTED_BIES.join(',')}.", required: false
        parameter :custom_fields_behavior, "Which demographic questions are asked, either #{Permission::CUSTOM_FIELDS_BEHAVIORS.join(',')}. 'custom' requires the permissions_custom_fields feature.", required: false
        parameter :group_ids, "An array of group id's associated to this permission", required: false
        parameter :require_confirmed_email, 'Whether a confirmed email address is required', required: false
        parameter :require_confirmed_phone_number, 'Whether a confirmed phone number is required', required: false
        parameter :confirmed_phone_number_expiry, 'Number of days after which the phone number must be confirmed again', required: false
        parameter :require_verification, 'Whether identity verification is required', required: false
        parameter :require_name, 'Whether a first and last name are required', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Permission)

      let(:action) { 'following' }
      let(:permitted_by) { 'users' }
      let(:group_ids) { create_list(:group, 3).map(&:id) }

      example_request 'Update a global permission' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :permitted_by)).to eq permitted_by
        expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to match_array group_ids
      end

      context "for the 'attending_event' permission, which inherits the global 'visiting' one" do
        let(:action) { 'attending_event' }

        example '[error] An inherited global permission cannot be updated before it is overridden', document: false do
          do_request(permission: { permitted_by: permitted_by })
          assert_status 404
        end
      end

      context 'for the visiting permission' do
        let(:action) { 'visiting' }
        let(:require_confirmed_email) { false }
        let(:require_confirmed_phone_number) { true }
        let(:confirmed_phone_number_expiry) { 90 }
        let(:require_verification) { true }
        let(:require_name) { false }

        example_request 'Update the visiting permission' do
          assert_status 200
          expect(response_data[:attributes]).to include(
            action: 'visiting',
            require_confirmed_email: false,
            require_confirmed_phone_number: true,
            confirmed_phone_number_expiry: 90,
            require_verification: true,
            require_name: false
          )
          expect(response_data.dig(:relationships, :groups, :data).pluck(:id)).to match_array group_ids

          permission = Permission.find_by!(permission_scope: nil, action: 'visiting')
          expect(permission).to have_attributes(
            require_confirmed_email: false,
            require_confirmed_phone_number: true,
            confirmed_phone_number_expiry: 90,
            require_verification: true,
            require_name: false
          )
        end
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
          @permission = @phase.permissions.find_by!(action: 'posting_idea')
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
                missing_user_attributes: [],
                email_action_required: nil,
                phone_action_required: nil
              },
              verification: false,
              custom_fields: {},
              onboarding: false,
              group_membership: false
            }
          })
        end
      end

      # Formerly the 'everyone_confirmed_email' permitted_by, now a 'users' permission
      # that only requires a confirmed email (no name, no password).
      context "'users' permission requiring only a confirmed email" do
        before do
          @user = create(:unconfirmed_user)
          header_token_for @user
          @permission = @phase.permissions.first
          @permission.update!(permitted_by: 'users', require_confirmed_email: true, require_name: false, require_password: false)
          create(:custom_field_birthyear, required: true)
          create(:custom_field_gender, required: false)
          create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_field')

          @user.update!(
            first_name: 'Jack',
            last_name: nil,
            password_digest: nil,
            custom_field_values: { 'gender' => 'male' }
          )
        end

        let(:action) { @permission.action }

        # NOTE: Unlike the old everyone_confirmed_email behaviour, a 'users' permission DOES
        # collect the global registration custom fields, so the unsatisfied required
        # fields are returned here.
        example_request 'Get the participation requirements of a passwordless user requiring confirmation in a phase' do
          assert_status 200
          expect(response_data[:attributes]).to eq({
            permitted: false,
            disabled_reason: 'user_not_active',
            requirements: {
              authentication: {
                permitted_by: 'users',
                missing_user_attributes: [],
                email_action_required: 'confirm_email',
                phone_action_required: nil
              },
              verification: false,
              custom_fields: { birthyear: 'required', extra_field: 'required' },
              onboarding: false,
              group_membership: false
            }
          })
        end
      end

      context "'users' permission with verification enabled but email disabled" do
        before do
          @permission = @phase.permissions.first
          @permission.update!(
            permitted_by: 'users',
            require_verification: true,
            require_confirmed_email: false
          )
        end

        let(:action) { @permission.action }

        example 'Blocks participation if user has confirmed email but is not verified' do
          @user.update!(
            email: 'test@user.com',
            email_confirmed_at: Time.current,
            confirmation_required: false,
            verified: false
          )
          do_request
          assert_status 200
          expect(response_data[:attributes][:permitted]).to be false
          expect(response_data[:attributes][:disabled_reason]).to eq 'user_missing_requirements'
        end

        example 'Allows participation is user has both email and is verified' do
          @user.update!(
            email: 'test@user.com',
            email_confirmed_at: Time.current,
            confirmation_required: false,
            verified: true
          )
          @user.identities << create(:franceconnect_identity, user: @user)
          do_request
          assert_status 200
          expect(response_data[:attributes][:permitted]).to be true
          expect(response_data[:attributes][:disabled_reason]).to be_nil
        end

        example 'Allows participation if user has no email but is verified' do
          @user.update!(
            email: nil,
            email_confirmed_at: nil,
            confirmation_required: true,
            verified: true
          )
          @user.identities << create(:franceconnect_identity, user: @user)
          do_request
          assert_status 200
          expect(response_data[:attributes][:permitted]).to be true
          expect(response_data[:attributes][:disabled_reason]).to be_nil
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
                missing_user_attributes: %w[last_name password],
                email_action_required: nil,
                phone_action_required: nil
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
                missing_user_attributes: [],
                email_action_required: nil,
                phone_action_required: nil
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
          @permission.update!(custom_fields_behavior: 'custom')
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
          @permission.update!(custom_fields_behavior: 'custom')
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
