# frozen_string_literal: true

require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  # NOTE: Most of the logic here is tested in the parent class tests - BasePermissionsService
  describe '"posting_initiative" denied_reason_for_action' do
    let(:action) { 'posting_initiative' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before { Permissions::PermissionsUpdateService.new.update_global_permissions }

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason_for_action(action, user)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_action(action, nil)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason_for_action(action, user)).to eq 'not_in_group'
    end
  end
end
