# frozen_string_literal: true

require 'rails_helper'

describe Permissions::SideFxPermissionService do
  include SideFxHelper

  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:permission) { create(:permission, permitted_by: 'users') }

  describe 'after_update' do
    it "logs a 'changed' action job with the change in the payload" do
      permission.update!(permitted_by: 'everyone')

      expect { service.after_update(permission, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          permission,
          'changed',
          user,
          permission.updated_at.to_i,
          payload: {
            permission: clean_time_attributes(permission.attributes),
            change: sanitize_change(permission.saved_changes)
          },
          project_id: permission.permission_scope.project_id
        )
    end

    it "logs a dedicated 'changed_permitted_by' action job when permitted_by changes" do
      permission.update!(permitted_by: 'everyone')

      expect { service.after_update(permission, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          permission,
          'changed_permitted_by',
          user,
          permission.updated_at.to_i,
          payload: { change: %w[users everyone] },
          project_id: permission.permission_scope.project_id
        )
    end

    it "does not log a 'changed_permitted_by' job when permitted_by is unchanged" do
      permission.update!(global_custom_fields: true)

      expect { service.after_update(permission, user) }
        .not_to have_enqueued_job(LogActivityJob)
        .with(permission, 'changed_permitted_by', anything, anything, anything)
    end

    it 'derives project_id as nil for a global permission' do
      global_permission = create(:global_permission, action: 'following', permitted_by: 'users')
      global_permission.update!(permitted_by: 'admins_moderators')

      expect { service.after_update(global_permission, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(global_permission, 'changed', user, anything, payload: anything, project_id: nil)
    end

    it 'captures group_ids changes in the payload when groups changed' do
      group = create(:group)
      old_group_ids = permission.group_ids
      permission.update!(group_ids: [group.id])

      expect { service.after_update(permission, user, old_group_ids) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          permission,
          'changed',
          user,
          permission.updated_at.to_i,
          payload: hash_including(change: hash_including('group_ids' => [old_group_ids, [group.id]])),
          project_id: permission.permission_scope.project_id
        )
    end

    it 'does not enqueue a job when nothing meaningful changed' do
      permission.update!(permitted_by: permission.permitted_by) # no-op save => empty saved_changes

      expect { service.after_update(permission, user, permission.group_ids) }
        .not_to have_enqueued_job(LogActivityJob)
    end
  end
end
