# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

  describe '#denied_reason_for_permission' do
    let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
    let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(service.denied_reason_for_permission(group_permission, user)).to eq 'not_signed_in' }
    end

    context 'when user is admin' do
      let(:admin) { create(:admin) }

      it { expect(service.denied_reason_for_permission(group_permission, admin)).to be_nil }
    end

    context 'when verified resident' do
      let(:user) { create(:user, verified: true) }

      it { expect(service.denied_reason_for_permission(group_permission, user)).to be_nil }
    end

    context 'when unverified resident' do
      let(:user) { create(:user, verified: false) }

      it { expect(service.denied_reason_for_permission(group_permission, user)).to eq 'not_verified' }
    end

    context 'when unverified resident and no verification group' do
      let(:groups) { [create(:group)] }
      let(:user) { create(:user, verified: false) }

      it { expect(service.denied_reason_for_permission(group_permission, user)).to eq 'not_in_group' }
    end

    context 'when unverified resident, belonging to the other group' do
      let(:user) { create(:user, verified: false, manual_groups: [groups.first]) }

      it { expect(service.denied_reason_for_permission(group_permission, user)).to be_nil }
    end
  end

  describe '#requirements' do
    context 'when permitted_by is set to a verification group' do
      let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
      let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(group_permission, nil)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is not verified' do
        let(:user) { create(:user, verified: false) }

        it 'requires verification' do
          requirements = service.requirements(group_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is verified' do
        let(:user) { create(:user, verified: true) }

        it 'verification is satisfied' do
          requirements = service.requirements(group_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('satisfied')
          expect(requirements[:permitted]).to be true
        end
      end
    end

    context 'when permitted_by group is NOT set to a verification group' do
      let(:groups) { [create(:group), create(:smart_group)] }
      let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      it 'verification is not required' do
        requirements = service.requirements(group_permission, nil)
        expect(requirements[:requirements][:special][:verification]).to eq('dont_ask')
      end
    end

    context 'when permitted_by is NOT set to groups' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'verification is not required' do
        requirements = service.requirements(permission, nil)
        expect(requirements[:requirements][:special][:verification]).to eq('dont_ask')
      end
    end
  end
end
