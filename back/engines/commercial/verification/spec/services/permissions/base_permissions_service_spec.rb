# frozen_string_literal: true

require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new }

  describe 'denied_reason_for_action' do
    let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
    let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'user_not_signed_in' }
    end

    context 'when user is admin' do
      let(:admin) { create(:admin) }

      it { expect(service.send(:user_denied_reason, group_permission, admin)).to be_nil }
    end

    context 'when verified resident' do
      let(:user) { create(:user, verified: true) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to be_nil }
    end

    context 'when unverified resident' do
      let(:user) { create(:user, verified: false) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'user_not_verified' }
    end

    context 'when unverified resident and no verification group' do
      let(:groups) { [create(:group)] }
      let(:user) { create(:user, verified: false) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'user_not_in_group' }
    end

    context 'when unverified resident, belonging to the other group' do
      let(:user) { create(:user, verified: false, manual_groups: [groups.first]) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to be_nil }
    end
  end
end
