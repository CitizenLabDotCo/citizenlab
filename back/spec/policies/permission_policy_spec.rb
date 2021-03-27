# frozen_string_literal: true

require 'rails_helper'

describe PermissionPolicy do
  subject { described_class.new(user, permission) }

  let(:scope) { PermissionPolicy::Scope.new(user, Permission) }

  before(:all) do # rubocop:disable RSpec/BeforeAfterAll
    @scope_types = PermissionsService.instance_variable_get(:@scope_spec_hash)

    # rubocop:disable Style/SingleLineMethods
    dummy_global_scope = Module.new do
      def self.actions(_scope = nil) %w[a1 a2] end

      def self.scope_type; nil end

      def self.scope_class; nil end
    end
    # rubocop:enable Style/SingleLineMethods

    PermissionsService.clear_scope_types
    PermissionsService.register_scope_type(dummy_global_scope)
  end

  after(:all) do
    # Restore registered scope-types as they were before the tests.
    PermissionsService.instance_variable_set(:@scope_spec_hash, @scope_types)
  end

  context 'for a visitor' do
    let(:user) { nil }
    let!(:permission) { create(:global_permission, :by_everyone, action: 'a1') }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:participation_conditions) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a user' do
    let(:user) { create(:user) }
    let!(:permission) { create(:global_permission, :by_everyone, action: 'a1') }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:participation_conditions) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a member of a group with granular permissions' do
    let(:user) { create(:user) }
    let(:group) { create(:group) }
    let!(:permission) { create(:global_permission, permitted_by: 'groups', groups: [group], action: 'a1') }

    before do
      group.members << user
    end

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:participation_conditions) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }
    let!(:permission) { create(:global_permission, :by_admins_moderators, action: 'a1') }

    it { is_expected.to permit(:show)             }
    it { is_expected.to permit(:update)           }
    it { is_expected.to permit(:participation_conditions) }

    it 'indexes the permission' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
