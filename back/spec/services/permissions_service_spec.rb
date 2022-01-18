# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

  before(:all) do
    # rubocop:disable RSpec/BeforeAfterAll
    @scope_types = PermissionsService.instance_variable_get(:@scope_spec_hash)

    # rubocop:disable Style/SingleLineMethods Layout/EmptyLineBetweenDefs
    dummy_global_scope = Module.new do
      def self.actions(_scope = nil) %w[action] end
      def self.scope_type; nil end
      def self.scope_class; nil end
    end
    # rubocop:enable Style/SingleLineMethods Layout/EmptyLineBetweenDefs

    PermissionsService.clear_scope_types
    PermissionsService.register_scope_type(dummy_global_scope)
  end

  after(:all) do
    # Restore registered scope-types as they were before the tests.
    PermissionsService.instance_variable_set(:@scope_spec_hash, @scope_types)
  end

  describe '#denied_reason' do
    let(:action) { 'action' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before do
      service.update_global_permissions
    end

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason(user, action)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason(nil, action)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason(user, action)).to eq 'not_permitted'
    end
  end
end
