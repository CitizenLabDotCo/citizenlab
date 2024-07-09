module Permissions
  class BasePermissionsService
    SUPPORTED_ACTIONS = %w[
      posting_initiative
      commenting_initiative
      reacting_initiative
      posting_idea
      commenting_idea
      reacting_idea
      voting
      annotating_document
      taking_survey
      taking_poll
    ].freeze

    USER_DENIED_REASONS = {
      user_not_signed_in: 'user_not_signed_in',
      user_not_active: 'user_not_active',
      user_not_permitted: 'user_not_permitted',
      user_not_in_group: 'user_not_in_group',
      user_missing_requirements: 'user_missing_requirements',
      user_not_verified: 'user_not_verified',
      user_blocked: 'user_blocked'
    }.freeze

    def initialize(user, user_requirements_service: nil)
      @user = user
      @timeline_service = TimelineService.new
      @user_requirements_service = user_requirements_service
      @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups: false)
    end

    private

    attr_reader :user, :user_requirements_service

    def supported_action?(action)
      return true if SUPPORTED_ACTIONS.include? action

      raise "Unsupported action: #{action}"
    end

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

    # User methods
    def user_denied_reason(permission, scope = nil)
      return if permission.permitted_by == 'everyone'
      return USER_DENIED_REASONS[:user_not_signed_in] unless user
      return USER_DENIED_REASONS[:user_blocked] if user.blocked?
      return USER_DENIED_REASONS[:user_missing_requirements] if user.confirmation_required?
      return USER_DENIED_REASONS[:user_not_active] unless user.active?
      return if UserRoleService.new.can_moderate? scope, user
      return USER_DENIED_REASONS[:user_not_permitted] if permission.permitted_by == 'admins_moderators'
      return USER_DENIED_REASONS[:user_missing_requirements] unless user_requirements_service.requirements(permission, user)[:permitted]
      return USER_DENIED_REASONS[:user_not_verified] if user_requirements_service.requires_verification?(permission, user)
      return USER_DENIED_REASONS[:user_not_in_group] if denied_when_permitted_by_groups?(permission)

      nil
    end

    def denied_when_permitted_by_groups?(permission)
      permission.permitted_by == 'groups' && permission.groups && !user.in_any_groups?(permission.groups)
    end
  end
end
