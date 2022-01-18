# frozen_string_literal: true

class PermissionsService

  class << self
    def register_scope_type(scope_spec)
      scope_spec_hash[scope_spec.scope_type] = scope_spec
    end

    def clear_scope_types
      @scope_spec_hash = {}
    end

    def scope_spec_hash
      @scope_spec_hash ||= {}
    end

    def scope_specs
      scope_spec_hash.values
    end

    def scope_types
      scope_spec_hash.keys
    end

    def scope_type_classes
      scope_types.without(nil).map(&:constantize)
    end

    def actions(scope)
      permission_scope_type = scope.nil? ? nil : scope.class.to_s
      scope_spec_hash[permission_scope_type].actions(scope)
    end

    def all_actions
      scope_specs.map(&:actions).flatten
    end
  end

  def update_permissions_for_scope(scope)
    actions = self.class.actions(scope)
    remove_extras_actions(scope, actions)
    add_missing_actions(scope, actions)
  end

  def update_global_permissions
    update_permissions_for_scope(nil)
  end

  def update_all_permissions
    update_global_permissions

    self.class.scope_type_classes.each do |model_class|
      model_class.all.each { |scope| update_permissions_for_scope(scope) }
    end

    Permission.select(&:invalid?).each(&:destroy!)
  end

  def denied_reason user, action, resource=nil
    scope = resource&.permission_scope
    permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

    if permission.blank? && self.class.actions(scope)
      update_permissions_for_scope scope
      permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
    end

    raise "Unknown action '#{action}' for resource: #{resource}" unless permission

    permission.denied_reason user
  end

  private

  def remove_extras_actions(scope, actions = nil)
    actions ||= self.class.actions(scope)
    Permission.where(permission_scope: scope)
              .where.not(action: actions)
              .destroy_all
  end

  def add_missing_actions(scope, actions = nil)
    missing_actions = missing_actions(scope, actions)
    permissions_hashes = missing_actions.map { |action| { action: action } }
    Permission.create(permissions_hashes) { |p| p.permission_scope = scope }
  end

  def missing_actions(scope, actions = nil)
    actions ||= self.class.actions(scope)
    actions - Permission.where(permission_scope: scope).pluck(:action)
  end
end
