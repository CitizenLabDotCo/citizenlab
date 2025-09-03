require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new(user) }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    # To allow permitted_by 'verified' we need to enable at least one verification method
    SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
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

    let(:permission) { create(:permission, permitted_by: permitted_by) }
    let(:denied_reason) { service.send(:user_denied_reason, permission) }

    context 'when permitted by everyone' do
      let(:permitted_by) { 'everyone' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by light users' do
      let(:permitted_by) { 'everyone_confirmed_email' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'user_not_signed_in' }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }
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

    context 'when permitted by full residents' do
      let(:permitted_by) { 'users' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'user_not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when light confirmed inactive resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered sso user' do
        before do
          facebook_identity = create(:facebook_identity)
          user.identities << facebook_identity
          user.update!(password_digest: nil)
          user.save!
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'user_not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }
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
          before do
            user.reset_confirmation_and_counts
            user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, manual_groups: [groups.last])
          end

          it { expect(denied_reason).to eq 'user_missing_requirements' }
        end

        context 'when light unconfirmed resident who is not a group member' do
          before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

          it { expect(denied_reason).to eq 'user_missing_requirements' }
        end

        context 'when fully registered resident who is not a group member' do
          it { expect(denied_reason).to eq 'user_not_in_group' }
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

          it 'ignores the verification value if permitted_by is not "verified"' do
            group_permission.update!(permitted_by: 'verified', verification_expiry: 1)
            group_permission.update!(permitted_by: 'users')
            travel_to Time.now + 2.days do
              expect(service.send(:user_denied_reason, group_permission)).to be_nil
            end
          end
        end
      end
    end

    context 'when permitted by "verified"' do
      let(:permitted_by) { 'verified' }

      context 'without groups' do
        # let(:verified_permission) { create(:permission, permitted_by: 'verified') }

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

          it 'does not requires verification before 1 day' do
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
        let(:permission) { create(:permission, permitted_by: 'verified', groups: groups) }

        context 'when not signed in' do
          let(:user) { nil }

          it { expect(denied_reason).to eq 'user_not_signed_in' }
        end

        context 'when light unconfirmed resident who is group member' do
          before do
            user.reset_confirmation_and_counts
            user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, manual_groups: [groups.last])
          end

          it { expect(denied_reason).to eq 'user_missing_requirements' }
        end

        context 'when light unconfirmed resident who is not a group member' do
          before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

          it { expect(denied_reason).to eq 'user_missing_requirements' }
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

    context 'when permitted by moderators' do
      let(:permitted_by) { 'admins_moderators' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'user_not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'user_not_permitted' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'user_missing_requirements' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'user_missing_requirements' }
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
