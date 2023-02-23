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

  def denied_reason(user, action, resource = nil)
    scope = resource&.permission_scope
    permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

    if permission.blank? && self.class.actions(scope)
      update_permissions_for_scope scope
      permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
    end

    raise "Unknown action '#{action}' for resource: #{resource}" unless permission

    permission.denied_reason user
  end

  def requirements(permission, user)
    requirements = requirements_mapping[permission.permitted_by]
    mark_satisfied_requirements! requirements, user if user
    permitted = requirements.values.none? do |subrequirements|
      subrequirements.value? 'require'
    end
    {
      permitted: permitted,
      requirements: requirements
    }
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
    Permission.create!(permissions_hashes) { |p| p.permission_scope = scope }
  end

  def missing_actions(scope, actions = nil)
    actions ||= self.class.actions(scope)
    actions - Permission.where(permission_scope: scope).pluck(:action)
  end

  def requirements_mapping
    everyone = {
      built_in: {
        first_name: 'dont_ask',
        last_name: 'dont_ask',
        email: 'dont_ask'
      },
      custom_fields: CustomField.registration.map(&:key).index_with { 'dont_ask' },
      special: {
        password: 'dont_ask',
        confirmation: 'dont_ask'
      }
    }
    {
      'everyone' => everyone,
      'everyone_confirmed_email' => everyone.deep_dup.tap do |everyone_confirmed_email|
        everyone_confirmed_email[:built_in][:email] = 'require'
        everyone_confirmed_email[:special][:confirmation] = 'require'
      end,
      'users' => everyone.deep_dup.tap do |users|
        users[:built_in][:first_name] = 'require'
        users[:built_in][:last_name] = 'require'
        users[:built_in][:email] = 'require'
        required_field_keys = CustomField.registration.required.map(&:key)
        users[:custom_fields].each_key do |key|
          users[:custom_fields][key] = 'require' if required_field_keys.include? key
        end
        users[:special][:password] = 'require'
        users[:special][:confirmation] = 'require' if AppConfiguration.instance.feature_activated?('user_confirmation')
      end,
      'groups' => {},
      'admins_moderators' => {}
    }
  end

  def mark_satisfied_requirements!(requirements, user)
    return requirements if !user

    requirements[:built_in]&.each_key do |attribute|
      requirements[:built_in][attribute] = 'satisfied' if !user.send(attribute).nil?
    end
    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields][key] = 'satisfied' if user.custom_field_values.key?(key)
    end
    requirements[:special]&.each_key do |special_key|
      is_satisfied = case special_key
      when 'password'
        !user.passwordless?
      when 'confirmation'
        user.confirmed?
      end
      requirements[:special][special_key] = 'satisfied' if is_satisfied
    end
  end
end
