# frozen_string_literal: true

module Permissions
  class SideFxPermissionService
    include SideFxHelper

    # old_group_ids: snapshot of the permission's group_ids taken before the save,
    # since group changes go through the groups_permissions join and don't show up
    # in permission.saved_changes.
    def after_update(permission, user, old_group_ids = nil)
      change = sanitize_change(permission.saved_changes)
      group_change = group_ids_change(permission, old_group_ids)
      change['group_ids'] = group_change if group_change

      return if change.blank?

      # Use the actual action time rather than permission.updated_at: a group-only
      # change updates the groups_permissions join, not the permission row, so its
      # updated_at would be stale and the activity would show the wrong time.
      acted_at = Time.now.to_i

      payload = { permission: clean_time_attributes(permission.attributes), change: change }
      LogActivityJob.perform_later(
        permission, 'changed', user, acted_at,
        payload: payload, project_id: project_id_for(permission)
      )

      # Dedicated activity, to make answering the following question easier;
      # "who made what change to `permitted_by`, and when?"
      return unless permission.saved_change_to_permitted_by?

      LogActivityJob.perform_later(
        permission, 'changed_permitted_by', user, acted_at,
        payload: { change: permission.saved_change_to_permitted_by },
        project_id: project_id_for(permission)
      )
    end

    private

    def group_ids_change(permission, old_group_ids)
      return nil if old_group_ids.nil?

      new_group_ids = permission.groups.reload.ids
      old = old_group_ids.sort
      return nil if old == new_group_ids.sort

      [old, new_group_ids]
    end

    # Permission has no project_id column; its scope is a Phase (which has a
    # project_id) or nil for a global permission.
    def project_id_for(permission)
      permission.permission_scope.try(:project_id)
    end
  end
end
