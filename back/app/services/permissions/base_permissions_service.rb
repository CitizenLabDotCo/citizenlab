module Permissions
  class BasePermissionsService
    SUPPORTED_ACTIONS = %w[
      following
      visiting
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
      attending_event
      volunteering
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
      @user_requirements_service = user_requirements_service
      @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    end

    def denied_reason_for_action(action, scope: nil)
      return unless supported_action? action

      permission = find_permission(action, scope: scope)
      user_denied_reason(permission)
    end

    private

    attr_reader :user, :user_requirements_service

    def supported_action?(action)
      SUPPORTED_ACTIONS.include? action
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
      return USER_DENIED_REASONS[:user_missing_requirements] unless user_requirements_service.permitted_for_permission?(permission, user)
      return USER_DENIED_REASONS[:user_not_verified] if user_requirements_service.requires_verification?(permission, user)
      return USER_DENIED_REASONS[:user_not_in_group] if denied_when_permitted_by_groups?(permission)

      nil
    end

    def denied_when_permitted_by_groups?(permission)
      permission.groups.any? && !user.in_any_groups?(permission.groups)
    end
  end
end
