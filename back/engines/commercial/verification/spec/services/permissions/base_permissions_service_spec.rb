# frozen_string_literal: true

require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new(user) }

  describe 'user_denied_reason' do
    before do
      # To allow permitted_by 'verified' we need to enable at least one verification method
      SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
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
        let(:user) { create(:user, verified: true) }

        it { expect(service.send(:user_denied_reason, group_permission)).to be_nil }
      end

      context 'when unverified resident' do
        let(:user) { create(:user, verified: false) }

        it { expect(service.send(:user_denied_reason, group_permission)).to eq 'user_not_verified' }
      end

      context 'when unverified resident and no verification group' do
        let(:groups) { [create(:group)] }
        let(:user) { create(:user, verified: false) }

        it { expect(service.send(:user_denied_reason, group_permission)).to eq 'user_not_in_group' }
      end

      context 'when unverified resident, belonging to the other group' do
        let(:user) { create(:user, verified: false, manual_groups: [groups.first]) }

        it { expect(service.send(:user_denied_reason, group_permission)).to be_nil }
      end

      context 'permission has a verification expiry value' do
        let(:user) { create(:user, verified: true) }

        before { create(:verification, user: user, method_name: 'fake_sso') }

        it 'ignores the verification value if permitted_by is not "verified"' do
          group_permission.update!(permitted_by: 'verified', verification_expiry: 1)
          group_permission.update!(permitted_by: 'users')
          travel_to Time.now + 2.days do
            expect(service.send(:user_denied_reason, group_permission)).to be_nil
          end
        end
      end
    end

    context 'verification via permitted_by "verified"' do
      let(:verified_permission) { create(:permission, permitted_by: 'verified') }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_signed_in' }
      end

      context 'when user is admin' do
        let(:user) { create(:admin) }

        it { expect(service.send(:user_denied_reason, verified_permission)).to be_nil }
      end

      context 'when verified resident' do
        let(:user) { create(:user, verified: true) }

        it { expect(service.send(:user_denied_reason, verified_permission)).to be_nil }
      end

      context 'when unverified resident' do
        let(:user) { create(:user, verified: false) }

        it { expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_verified' }
      end

      context 'when group membership required' do
        let(:group) { create(:group) }

        before { verified_permission.update!(groups: [group]) }

        context 'when unverified resident not in group' do
          let(:user) { create(:user, verified: false) }

          it { expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_verified' }
        end

        context 'when unverified resident, belonging to group' do
          let(:user) { create(:user, verified: false, manual_groups: [group]) }

          it { expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_verified' }
        end

        context 'when verified resident, not in group' do
          let(:user) { create(:user, verified: true) }

          it { expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_in_group' }
        end

        context 'when verified resident, belonging to group' do
          let(:user) { create(:user, verified: true, manual_groups: [group]) }

          it { expect(service.send(:user_denied_reason, verified_permission)).to be_nil }
        end
      end

      context 'permission has a verification expiry value' do
        let(:user) { create(:user, verified: true) }

        before { create(:verification, user: user, method_name: 'fake_sso') }

        it 'does not requires verification before 1 day' do
          verified_permission.update!(verification_expiry: 1)
          travel_to Time.now + 23.hours do
            expect(service.send(:user_denied_reason, verified_permission)).to be_nil
          end
        end

        it 'requires verification after 1 day' do
          verified_permission.update!(verification_expiry: 1)
          travel_to Time.now + 2.days do
            expect(service.send(:user_denied_reason, verified_permission)).to eq 'user_not_verified'
          end
        end
      end
    end
  end
end
