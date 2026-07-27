module Permissions
  class BasePermissionsService
    USER_DENIED_REASONS = {
      user_not_signed_in: 'user_not_signed_in',
      user_not_active: 'user_not_active',
      user_not_permitted: 'user_not_permitted',
      user_not_in_group: 'user_not_in_group',
      user_missing_requirements: 'user_missing_requirements',
      user_not_verified: 'user_not_verified',
      user_blocked: 'user_blocked'
    }.freeze

    PROJECT_DENIED_REASONS = {
      project_inactive: 'project_inactive'
    }.freeze

    def initialize(user, user_requirements_service: nil)
      @user = user
      @user_requirements_service = user_requirements_service
      @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    end

    def denied_reason_for_action(action, scope: nil)
      permission = find_permission(action, scope: scope)
      user_denied_reason(permission)
    end

    private

    attr_reader :user, :user_requirements_service

    def find_permission(action, scope: nil)
      permission = scope&.permissions&.find { |p| p[:action] == action }

      if permission.blank?
        permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

        if permission.blank? && Permission.available_actions(scope)
          Permissions::PermissionsUpdateService.new.update_permissions_for_scope scope
          permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
        end
      end

      raise "Unknown action '#{action}' for scope: #{scope}" if !permission

      permission
    end

    def user_denied_reason(permission)
      return if permission.permitted_by == 'everyone'
      return USER_DENIED_REASONS[:user_not_signed_in] unless user
      return USER_DENIED_REASONS[:user_blocked] if user.blocked?
      return USER_DENIED_REASONS[:user_missing_requirements] if user.confirmation_required?
      return USER_DENIED_REASONS[:user_not_active] unless user.active?
      return if UserRoleService.new.can_moderate? permission, user
      return USER_DENIED_REASONS[:user_not_permitted] if permission.permitted_by == 'admins_moderators'
      return USER_DENIED_REASONS[:user_missing_requirements] unless user_requirements_service.permitted_for_permission?(permission, user)
      return USER_DENIED_REASONS[:user_not_verified] if user_requirements_service.requires_verification?(permission, user)
      return USER_DENIED_REASONS[:user_not_in_group] if permission.groups.any? && !user.in_any_groups?(permission.groups)

      nil
    end

    def project_denied_reason(project)
      PROJECT_DENIED_REASONS[:project_inactive] if project.admin_publication.archived?
    end

    def descriptor(reason)
      { enabled: !reason, disabled_reason: reason }
    end
  end
end
