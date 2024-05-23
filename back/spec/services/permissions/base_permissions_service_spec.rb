# frozen_string_literal: true

require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe 'denied_reason_for_permission' do
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
    let(:denied_reason) { service.send(:user_denied_reason, permission, user) }

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
    end

    context 'when permitted by groups' do
      let(:groups) { create_list(:group, 2) }
      let(:permission) { create(:permission, permitted_by: 'groups', groups: groups) }

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

      context 'when permitted by is changed from groups to users' do
        before { permission.update!(permitted_by: 'users') }

        it { expect(denied_reason).to be_nil }
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
