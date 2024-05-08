# frozen_string_literal: true

class PermissionsService

  # TODO: JS - Scope here is probably just phase OR null now
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

    Permission::SCOPE_TYPES.compact.each do |model_class|
      model_class.constantize.all.each { |scope| update_permissions_for_scope(scope) }
    end

    Permission.select(&:invalid?).each(&:destroy!)
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
      ParticipationPermissionsService.new.get_current_phase idea.project
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
    if scope && !scope.native_survey?
      Permission.where(permission_scope: scope, permitted_by: 'everyone').update!(permitted_by: 'users')
    end
  end
end
