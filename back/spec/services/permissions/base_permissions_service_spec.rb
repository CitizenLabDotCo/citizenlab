require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new(user) }

  before do
    # Enable a verification method so that verifications can be created and checked
    AppConfiguration.instance.settings['id_config'] = { 'allowed' => true, 'enabled' => true, 'id_methods' => [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
    AppConfiguration.instance.save!
  end

  describe 'denied_reason_for_action' do
    let(:user) { nil }
    let(:phase) { create(:single_phase_ideation_project).phases.first }

    before do
      Permission.where(permission_scope: phase).destroy_all
      Permissions::PermissionInheritanceService.clear_source_permission_cache
    end

    it 'resolves a phase action that has no permission of its own through the visiting permission' do
      create(:global_permission, action: 'visiting', permitted_by: 'admins_moderators')

      expect(service.denied_reason_for_action('posting_idea', scope: phase)).to eq 'user_not_signed_in'
    end

    it 'uses the permission of its own once the action has been overridden' do
      create(:global_permission, action: 'visiting', permitted_by: 'users')
      Permissions::PermissionInheritanceService.new.override!(phase, 'posting_idea')
        .update!(permitted_by: 'everyone')

      expect(service.denied_reason_for_action('posting_idea', scope: phase)).to be_nil
    end

    it 'creates a missing global permission on demand, since there is nothing to inherit from' do
      Permission.where(permission_scope: nil).destroy_all

      service.denied_reason_for_action('following', scope: nil)

      expect(Permission.find_by(permission_scope: nil, action: 'following')).to be_present
    end

    it 'raises for an action the scope does not support' do
      expect { service.denied_reason_for_action('taking_survey', scope: phase) }
        .to raise_error(/Unknown action 'taking_survey'/)
    end
  end

  describe 'user_denied_reason' do
    before do
      create(:custom_field_birthyear, required: true)
      create(:custom_field_gender, required: false)
      create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field')
      create(:custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field')
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jerry',
        last_name: 'Jones',
        email: 'jerry@jones.com',
        custom_field_values: {
          'gender' => 'male',
          'birthyear' => 1982,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        registration_completed_at: Time.now,
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    context 'when permitted by everyone' do
      let(:permission) { create(:permission, permitted_by: 'everyone') }
      let(:denied_reason) { service.send(:user_denied_reason, permission) }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed resident' do
        let(:user) { create(:unconfirmed_user) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when unconfirmed admin' do
        before do
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by users' do
      let(:permission) { create(:permission, permitted_by: 'users') }
      let(:denied_reason) { service.send(:user_denied_reason, permission) }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'user_not_signed_in' }
      end

      context 'when confirmed resident without any other attributes' do
        let(:user) do
          u = create(:unconfirmed_user)
          RequestEmailConfirmationCodeJob.perform_now(u)
          u.email_confirmation.confirm!
          u
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }

        it 'works if name, password and custom field requirements are disabled' do
          permission = create(
            :permission,
            permitted_by: 'users',
            require_name: false,
            require_password: false
          )
          permission.update!(custom_fields_behavior: 'disabled')
          permission.permissions_custom_fields.destroy_all

          denied_reason = service.send(:user_denied_reason, permission)
          expect(denied_reason).to be_nil
        end

        it 'does not work if name not required but password required, custom field requirements disabled' do
          permission = create(
            :permission,
            permitted_by: 'users',
            require_name: false,
            require_password: true
          )
          permission.update!(custom_fields_behavior: 'disabled')
          permission.permissions_custom_fields.destroy_all

          denied_reason = service.send(:user_denied_reason, permission)
          expect(denied_reason).to eq 'user_missing_requirements'
        end

        it 'does not work if neither name nor password required, but there is a required custom field' do
          permission = create(
            :permission,
            permitted_by: 'users',
            require_name: false,
            require_password: false
          )

          denied_reason = service.send(:user_denied_reason, permission)
          expect(denied_reason).to eq 'user_missing_requirements'
        end
      end

      context 'when unconfirmed resident' do
        before do
          user.update!(confirmation_required: true, email_confirmed_at: nil)
        end

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.update!(confirmation_required: true, email_confirmed_at: nil)
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'group membership' do
        let(:groups) { create_list(:group, 2) }
        let(:permission) { create(:permission, permitted_by: 'users', groups: groups) }

        context 'when not signed in' do
          let(:user) { nil }

          it { expect(denied_reason).to eq 'user_not_signed_in' }
        end

        context 'when light unconfirmed resident who is group member' do
          let(:user) { create(:unconfirmed_user, manual_groups: [groups.last]) }

          it { expect(denied_reason).to eq 'user_not_active' }
        end

        context 'when light unconfirmed resident who is not a group member' do
          let(:user) { create(:unconfirmed_user) }

          it { expect(denied_reason).to eq 'user_not_active' }
        end

        context 'when fully registered resident who is not a group member' do
          it { expect(denied_reason).to eq 'user_not_in_group' }
        end

        context 'when moderator of the permission scope project who is not a group member' do
          before { user.update!(roles: [{ type: 'project_moderator', project_id: permission.permission_scope.project_id }]) }

          it { expect(denied_reason).to be_nil }
        end

        context 'when admin' do
          before { user.update!(roles: [{ type: 'admin' }]) }

          it { expect(denied_reason).to be_nil }
        end

        context 'when confirmed inactive admin' do
          before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

          it { expect(denied_reason).to eq 'user_not_active' }
        end
      end

      context 'verification via groups' do
        let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
        let(:group_permission) { create(:permission, permitted_by: 'users', groups: groups) }

        context 'when not signed in' do
          let(:user) { nil }

          it { expect(service.send(:user_denied_reason, group_permission)).to eq 'user_not_signed_in' }
        end

        context 'when user is admin' do
          let(:user) { create(:admin) }

          it { expect(service.send(:user_denied_reason, group_permission)).to be_nil }
        end

        context 'when verified resident' do
          before { user.update!(verified: true) }

          it { expect(service.send(:user_denied_reason, group_permission)).to be_nil }
        end

        context 'when unverified resident' do
          before { user.update!(verified: false) }

          it { expect(service.send(:user_denied_reason, group_permission)).to eq 'user_not_verified' }
        end

        context 'when unverified resident and no verification group' do
          let(:groups) { [create(:group)] }

          before { user.update!(verified: false) }

          it { expect(service.send(:user_denied_reason, group_permission)).to eq 'user_not_in_group' }
        end

        context 'when unverified resident, belonging to the other group' do
          before { user.update!(verified: false, manual_groups: [groups.first]) }

          it { expect(service.send(:user_denied_reason, group_permission)).to be_nil }
        end

        context 'permission has a verification expiry value' do
          before do
            user.update!(verified: true)
            create(:verification, user: user, method_name: 'fake_sso')
          end

          it 'ignores the verification value if require_verification: false' do
            group_permission.update!(require_verification: false, verification_expiry: 1)
            travel_to Time.now + 2.days do
              expect(service.send(:user_denied_reason, group_permission)).to be_nil
            end
          end
        end
      end

      context 'when a confirmed phone number is required' do
        let(:permission) { create(:permission, permitted_by: 'users', require_confirmed_phone_number: true) }
        let(:denied_reason) { service.send(:user_denied_reason, permission) }

        include_context 'with sms feature enabled'

        context 'when the user has no phone number' do
          before { user.update!(phone: nil, phone_confirmed_at: nil) }

          it { expect(denied_reason).to eq 'user_missing_requirements' }
        end

        context 'when the user has an unconfirmed phone number' do
          before { user.update!(phone: '+3212345678', phone_confirmed_at: nil) }

          it { expect(denied_reason).to eq 'user_missing_requirements' }
        end

        context 'when the user has a confirmed phone number' do
          before { user.update!(phone: '+3212345678', phone_confirmed_at: Time.now) }

          it { expect(denied_reason).to be_nil }
        end

        context 'when the user is admin' do
          before { user.update!(roles: [{ type: 'admin' }]) }

          it { expect(denied_reason).to be_nil }
        end
      end

      context 'when email and verification are required' do
        let(:permission) { create(:permission, permitted_by: 'users', require_verification: true) }

        context 'without groups' do
          context 'when not signed in' do
            let(:user) { nil }

            it { expect(denied_reason).to eq 'user_not_signed_in' }
          end

          context 'when user is admin' do
            let(:user) { create(:admin) }

            it { expect(denied_reason).to be_nil }
          end

          context 'when verified resident' do
            before { user.update!(verified: true) }

            it { expect(denied_reason).to be_nil }
          end

          context 'when unverified resident' do
            before { user.update!(verified: false) }

            it { expect(denied_reason).to eq 'user_not_verified' }
          end

          context 'permission has a verification expiry value' do
            before do
              user.update!(verified: true)
              create(:verification, user: user, method_name: 'fake_sso')
            end

            it 'does not require verification before 1 day' do
              permission.update!(verification_expiry: 1)
              travel_to Time.now + 23.hours do
                expect(denied_reason).to be_nil
              end
            end

            it 'requires verification after 1 day' do
              permission.update!(verification_expiry: 1)
              travel_to Time.now + 2.days do
                expect(denied_reason).to eq 'user_not_verified'
              end
            end
          end
        end

        context 'when groups are also required' do
          let(:groups) { create_list(:group, 2) }
          let(:permission) { create(:permission, permitted_by: 'users', require_verification: true, groups: groups) }

          context 'when not signed in' do
            let(:user) { nil }

            it { expect(denied_reason).to eq 'user_not_signed_in' }
          end

          context 'when unconfirmed resident who is group member' do
            let(:user) { create(:unconfirmed_user, manual_groups: [groups.last]) }

            it { expect(denied_reason).to eq 'user_not_active' }
          end

          context 'when unconfirmed resident who is not a group member' do
            let(:user) { create(:unconfirmed_user) }

            it { expect(denied_reason).to eq 'user_not_active' }
          end

          context 'when fully registered resident who is not a group member' do
            it { expect(denied_reason).to eq 'user_not_verified' }
          end

          context 'when verified resident who is not a group member' do
            before { user.update!(verified: true) }

            it { expect(denied_reason).to eq 'user_not_in_group' }
          end

          context 'when unverified resident, belonging to group' do
            before { user.update!(verified: false, manual_groups: groups) }

            it { expect(denied_reason).to eq 'user_not_verified' }
          end

          context 'when verified resident, belonging to group' do
            before { user.update!(verified: true, manual_groups: groups) }

            it { expect(denied_reason).to be_nil }
          end

          context 'when admin' do
            before { user.update!(roles: [{ type: 'admin' }]) }

            it { expect(denied_reason).to be_nil }
          end

          context 'when confirmed inactive admin' do
            before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

            it { expect(denied_reason).to eq 'user_not_active' }
          end
        end
      end

      context 'when verification is required but email is not' do
        let(:permission) do
          create(
            :permission,
            permitted_by: 'users',
            require_verification: true,
            require_confirmed_email: false
          )
        end

        context 'when not signed in' do
          let(:user) { nil }

          it { expect(denied_reason).to eq 'user_not_signed_in' }
        end

        context 'when verified resident' do
          before do
            user.update!(verified: true)
            user.identities << create(:franceconnect_identity, user: user)
          end

          it { expect(denied_reason).to be_nil }
        end

        context 'when unverified resident' do
          before { user.update!(verified: false) }

          it { expect(denied_reason).to eq 'user_not_verified' }
        end

        context 'when verified resident without confirmed email' do
          before do
            user.update!(
              verified: true,
              email_confirmed_at: nil,
              confirmation_required: true
            )
            user.identities << create(:franceconnect_identity, user: user)
          end

          it { expect(denied_reason).to be_nil }
        end
      end
    end

    context 'when permitted by moderators' do
      let(:permission) { create(:permission, permitted_by: 'admins_moderators') }
      let(:denied_reason) { service.send(:user_denied_reason, permission) }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'user_not_signed_in' }
      end

      context 'when light confirmed resident' do
        let(:user) do
          u = create(:unconfirmed_user)
          RequestEmailConfirmationCodeJob.perform_now(u)
          u.email_confirmation.confirm!
          u
        end

        it { expect(denied_reason).to eq 'user_not_permitted' }
      end

      context 'when moderator of the permission scope project' do
        before { user.update!(roles: [{ type: 'project_moderator', project_id: permission.permission_scope.project_id }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when moderator of another project' do
        before { user.update!(roles: [{ type: 'project_moderator', project_id: create(:project).id }]) }

        it { expect(denied_reason).to eq 'user_not_permitted' }
      end

      context 'when moderator and the permission scope is global' do
        let(:permission) { create(:permission, action: 'following', permitted_by: 'admins_moderators', permission_scope: nil) }

        before { user.update!(roles: [{ type: 'project_moderator', project_id: create(:project).id }]) }

        it { expect(denied_reason).to eq 'user_not_permitted' }
      end

      context 'when unconfirmed resident' do
        before do
          user.update!(confirmation_required: true, email_confirmed_at: nil)
        end

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.update!(
            confirmation_required: true,
            email_confirmed_at: nil,
            roles: [{ type: 'admin' }]
          )
        end

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end
    end
  end
end
