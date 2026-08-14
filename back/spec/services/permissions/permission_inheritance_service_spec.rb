# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionInheritanceService do
  subject(:service) { described_class.new }

  let(:phase) { create(:single_phase_ideation_project).phases.first }
  let!(:visiting_permission) do
    create(
      :global_permission,
      action: 'visiting',
      permitted_by: 'users',
      require_confirmed_email: true,
      require_name: false,
      require_password: false,
      require_verification: true,
      verification_expiry: 30
    )
  end

  before { described_class.clear_source_permission_cache }

  describe '#inheritable_scope?' do
    it 'is true for a phase' do
      expect(service.inheritable_scope?(phase)).to be true
    end

    it 'is false for the global scope, which holds the source permission' do
      expect(service.inheritable_scope?(nil)).to be false
    end
  end

  describe '#find' do
    it 'returns the persisted permission when the action was overridden' do
      permission = create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'admins_moderators')

      found = service.find(phase, 'posting_idea')
      expect(found.id).to eq permission.id
      expect(found).not_to be_inherited
    end

    it 'returns an unsaved copy of the visiting permission when the action was not overridden' do
      found = service.find(phase, 'posting_idea')

      expect(found).to be_inherited
      expect(found).not_to be_persisted
      expect(found.action).to eq 'posting_idea'
      expect(found.permission_scope).to eq phase
      expect(found).to have_attributes(
        permitted_by: 'users',
        require_confirmed_email: true,
        require_name: false,
        require_password: false,
        require_verification: true,
        verification_expiry: 30
      )
    end

    it 'returns nil for an action the scope does not support' do
      expect(service.find(phase, 'taking_survey')).to be_nil
    end

    it 'returns nil for a scope that does not inherit' do
      expect(service.find(nil, 'posting_idea')).to be_nil
    end

    it 'reflects later changes to the visiting permission' do
      visiting_permission.update!(require_name: true)
      described_class.clear_source_permission_cache

      expect(service.find(phase, 'posting_idea').require_name).to be true
    end

    it 'inherits the groups of the visiting permission' do
      group = create(:group)
      visiting_permission.update!(groups: [group])
      described_class.clear_source_permission_cache

      expect(service.find(phase, 'posting_idea').groups).to eq [group]
    end

    it 'inherits the persisted demographic questions of the visiting permission' do
      custom_field = create(:custom_field)
      visiting_permission.update!(global_custom_fields: false)
      create(:permissions_custom_field, permission: visiting_permission, custom_field: custom_field, required: true)
      described_class.clear_source_permission_cache

      inherited = service.find(phase, 'posting_idea')
      expect(inherited.permissions_custom_fields.map(&:custom_field_id)).to eq [custom_field.id]
    end

    it 'falls back to the model defaults when there is no visiting permission' do
      visiting_permission.destroy!
      described_class.clear_source_permission_cache

      found = service.find(phase, 'posting_idea')
      expect(found).to be_inherited
      expect(found.permitted_by).to eq 'users'
    end

    it 'returns a readonly record, so it cannot be saved by accident' do
      expect { service.find(phase, 'posting_idea').save }.to raise_error ActiveRecord::ReadOnlyRecord
    end
  end

  describe '#effective_permissions' do
    it 'returns one permission per enabled action, in the action order of the scope' do
      permissions = service.effective_permissions(phase)

      expect(permissions.map(&:action)).to eq %w[posting_idea commenting_idea reacting_idea attending_event]
      expect(permissions.map(&:inherited?)).to all(be true)
    end

    it 'mixes overridden and inherited permissions' do
      create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'admins_moderators')

      permissions = service.effective_permissions(phase)
      expect(permissions.map { |p| [p.action, p.inherited?] }).to eq [
        ['posting_idea', false],
        ['commenting_idea', true],
        ['reacting_idea', true],
        ['attending_event', true]
      ]
    end

    it 'excludes actions that are disabled on the phase' do
      phase.update!(commenting_enabled: false)

      expect(service.effective_permissions(phase).map(&:action)).not_to include 'commenting_idea'
    end

    it 'returns only the persisted permissions for the global scope' do
      expect(service.effective_permissions(nil).map(&:action)).to eq ['visiting']
    end
  end

  describe '#override!' do
    it 'persists a copy of the visiting permission' do
      permission = service.override!(phase, 'posting_idea')

      expect(permission).to be_persisted
      expect(permission).not_to be_inherited
      expect(permission.action).to eq 'posting_idea'
      expect(permission.permission_scope).to eq phase
      expect(permission).to have_attributes(
        permitted_by: 'users',
        require_confirmed_email: true,
        require_name: false,
        require_password: false,
        require_verification: true,
        verification_expiry: 30
      )
    end

    it 'copies the groups of the visiting permission' do
      group = create(:group)
      visiting_permission.update!(groups: [group])
      described_class.clear_source_permission_cache

      expect(service.override!(phase, 'posting_idea').groups).to eq [group]
    end

    it 'copies the persisted demographic questions of the visiting permission' do
      custom_field = create(:custom_field)
      visiting_permission.update!(global_custom_fields: false)
      create(:permissions_custom_field, permission: visiting_permission, custom_field: custom_field, required: false, ordering: 0)
      described_class.clear_source_permission_cache

      permission = service.override!(phase, 'posting_idea')
      expect(permission.permissions_custom_fields.pluck(:custom_field_id, :required)).to eq [[custom_field.id, false]]
      # Otherwise the copy would fall back to the platform's user fields and
      # ignore the fields it just copied.
      expect(permission.global_custom_fields).to be false
    end

    it 'no longer follows the visiting permission afterwards' do
      permission = service.override!(phase, 'posting_idea')
      visiting_permission.update!(require_name: true)
      described_class.clear_source_permission_cache

      expect(permission.reload.require_name).to be false
    end

    it 'returns the existing permission when the action was already overridden' do
      existing = create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'admins_moderators')

      expect { service.override!(phase, 'posting_idea') }.not_to change(Permission, :count)
      expect(service.override!(phase, 'posting_idea').id).to eq existing.id
    end

    it 'raises for a scope that does not support inheritance' do
      expect { service.override!(nil, 'following') }.to raise_error described_class::UnsupportedScope
    end
  end

  describe '#inherit!' do
    it 'destroys the permission and returns the inherited one' do
      permission = create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'admins_moderators')

      inherited = service.inherit!(permission)

      expect(Permission.where(id: permission.id)).to be_empty
      expect(inherited).to be_inherited
      expect(inherited.permitted_by).to eq 'users'
    end

    it 'destroys the groups and demographic questions of the permission' do
      permission = create(:permission, action: 'posting_idea', permission_scope: phase, groups: [create(:group)], global_custom_fields: false)
      custom_field = create(:permissions_custom_field, permission: permission)

      service.inherit!(permission)

      expect(GroupsPermission.where(permission_id: permission.id)).to be_empty
      expect(PermissionsCustomField.where(id: custom_field.id)).to be_empty
    end

    it 'raises for a global permission' do
      expect { service.inherit!(visiting_permission) }.to raise_error described_class::UnsupportedScope
    end
  end

  describe '#matches_source?' do
    it 'is true for a permission that is an exact copy of the visiting permission' do
      expect(service.matches_source?(service.override!(phase, 'posting_idea'))).to be true
    end

    it 'is false when an inheritable attribute differs' do
      permission = service.override!(phase, 'posting_idea')
      permission.update!(require_name: true)

      expect(service.matches_source?(permission)).to be false
    end

    it 'is false when the groups differ' do
      permission = service.override!(phase, 'posting_idea')
      permission.update!(groups: [create(:group)])

      expect(service.matches_source?(permission)).to be false
    end

    it 'is false when the demographic questions differ' do
      permission = service.override!(phase, 'posting_idea')
      permission.update!(global_custom_fields: false)
      create(:permissions_custom_field, permission: permission)

      expect(service.matches_source?(permission)).to be false
    end

    it 'is false for a global permission' do
      expect(service.matches_source?(visiting_permission)).to be false
    end
  end

  describe '.source_permission' do
    it 'caches the visiting permission for the duration of the request' do
      expect(described_class.source_permission.id).to eq visiting_permission.id

      expect(Permission).not_to receive(:includes)
      expect(described_class.source_permission.id).to eq visiting_permission.id
    end
  end
end
