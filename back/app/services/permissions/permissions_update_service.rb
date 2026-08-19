# frozen_string_literal: true

class Permissions::PermissionsUpdateService
  # scope = phase or null
  #
  # Phase permissions are not created here: an action without a permission of
  # its own inherits the global 'visiting' permission, and only gets a row once
  # an admin overrides it. Global permissions have nothing to inherit from, so
  # they are still created eagerly.
  # See Permissions::PermissionInheritanceService.
  def update_permissions_for_scope(scope)
    actions = Permission.available_actions scope
    remove_extras_actions(scope, actions)
    add_missing_actions(scope, actions) unless inheritance_service.inheritable_scope?(scope)
    fix_permitted_by(scope)
  end

  def update_global_permissions
    update_permissions_for_scope(nil)
  end

  def update_all_permissions
    update_global_permissions

    Permission::SCOPE_TYPES.compact.each do |model_class|
      model_class.constantize.all.each { |scope| update_permissions_for_scope(scope) }
    end
    Permission.includes(:permission_scope).select(&:invalid?).each(&:destroy!)
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

  def inheritance_service
    @inheritance_service ||= Permissions::PermissionInheritanceService.new
  end

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
end
