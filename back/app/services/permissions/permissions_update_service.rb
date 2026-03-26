# frozen_string_literal: true

class Permissions::PermissionsUpdateService
  # scope = phase or null
  def update_permissions_for_scope(scope)
    actions = Permission.available_actions scope
    remove_extras_actions(scope, actions)
    add_missing_actions(scope, actions)
    fix_permitted_by(scope)
  end

  def update_global_permissions
    update_permissions_for_scope(nil)
  end

  def update_all_permissions
    update_global_permissions
    update_all_phase_permissions
  end

  def permission_scope_from_permissions_params(params)
    parent_param = params[:parent_param]
    scope_id = params[parent_param]
    case parent_param
    when nil
      nil
    when :project_id
      Project.find(scope_id)
    when :phase_id
      Phase.find(scope_id)
    when :idea_id
      idea = Idea.find(scope_id)
      TimelineService.new.current_phase_not_archived idea.project
    end
  end

  private

  def remove_extras_actions(scope, actions = nil)
    actions ||= Permission.available_actions(scope)
    Permission.where(permission_scope: scope)
      .where.not(action: actions)
      .destroy_all
  end

  def add_missing_actions(scope, actions = nil)
    missing_actions = missing_actions(scope, actions)
    permissions_hashes = missing_actions.map { |action| { action: action } }
    Permission.create!(permissions_hashes) { |p| p.permission_scope = scope }
  end

  def missing_actions(scope, actions = nil)
    actions ||= Permission.available_actions(scope)
    actions - Permission.where(permission_scope: scope).pluck(:action)
  end

  def fix_permitted_by(scope)
    if scope && !scope.pmethod.supports_permitted_by_everyone?
      Permission.where(permission_scope: scope, permitted_by: 'everyone').update!(permitted_by: 'users')
    end
  end

  # Separate method for phases to optimize the number of queries when run against a big platform
  # Instead of running update_permissions_for_scope for each phase
  def update_all_phase_permissions
    phases = Phase.all.to_a
    phase_ids = phases.map(&:id)

    # Load all phase permissions in one query
    all_permissions = Permission
                        .where(permission_scope_type: 'Phase', permission_scope_id: phase_ids)
                        .pluck(:id, :permission_scope_id, :action, :permitted_by)
    permissions_by_phase = all_permissions.group_by { |_id, scope_id, _action, _pb| scope_id }

    ids_to_delete = []
    records_to_create = []
    ids_to_fix_permitted_by = []

    phases.each do |phase|
      actions = Permission.available_actions(phase)
      existing = permissions_by_phase[phase.id] || []
      existing_actions = existing.map { |_id, _sid, action, _pb| action }

      # Extras to remove
      existing.each do |id, _sid, action, _pb|
        ids_to_delete << id unless actions.include?(action)
      end

      # Missing to add
      (actions - existing_actions).each do |action|
        records_to_create << { action: action, permission_scope_id: phase.id, permission_scope_type: 'Phase' }
      end

      # Fix permitted_by
      next if phase.pmethod.supports_permitted_by_everyone?

      existing.each do |id, _sid, _action, pb|
        ids_to_fix_permitted_by << id if pb == 'everyone'
      end
    end

    Permission.where(id: ids_to_delete).destroy_all if ids_to_delete.any?
    Permission.create!(records_to_create) if records_to_create.any?
    Permission.where(id: ids_to_fix_permitted_by).update_all(permitted_by: 'users') if ids_to_fix_permitted_by.any?

    # Clean up orphaned permissions (scope was deleted or has unsupported type)
    valid_phase_permissions = Permission.where(permission_scope_type: 'Phase', permission_scope_id: phase_ids)
    Permission.where.not(permission_scope_id: nil)
              .where.not(id: valid_phase_permissions.select(:id))
              .destroy_all
  end
end
