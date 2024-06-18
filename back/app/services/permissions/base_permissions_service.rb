# frozen_string_literal: true

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

    def initialize
      super
      @timeline_service = TimelineService.new
    end

    # NOTE: Where phase and project are nil, the check is for global permissions (ie initiatives)
    def denied_reason_for_action(action, user, phase = nil, project: nil)
      return unless supported_action? action

      permission = find_permission(action, phase)
      user_denied_reason(permission, user, project)
    end

    private

    def supported_action?(action)
      return true if SUPPORTED_ACTIONS.include? action

      raise "Unsupported action: #{action}"
    end

    def find_permission(action, phase)
      permission = phase&.permissions&.find { |p| p[:action] == action }

      if permission.blank?
        scope = phase&.permission_scope # If phase is nil, then this is a global permission (ie for initiatives)
        permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

        if permission.blank? && Permission.available_actions(scope)
          Permissions::PermissionsUpdateService.new.update_permissions_for_scope scope
          permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
        end
      end

      raise "Unknown action '#{action}' for phase: #{phase}" unless permission

      permission
    end

    # User methods
    def user_denied_reason(permission, user, scope = nil)
      return if permission.permitted_by == 'everyone'
      return USER_DENIED_REASONS[:user_not_signed_in] unless user
      return USER_DENIED_REASONS[:user_blocked] if user.blocked?
      return USER_DENIED_REASONS[:user_missing_requirements] if user.confirmation_required?
      return USER_DENIED_REASONS[:user_not_active] unless user.active?
      return if UserRoleService.new.can_moderate? scope, user
      return USER_DENIED_REASONS[:user_not_permitted] if permission.permitted_by == 'admins_moderators'
      return USER_DENIED_REASONS[:user_missing_requirements] unless user_requirements_service.requirements(permission, user)[:permitted]
      return USER_DENIED_REASONS[:user_not_verified] if user_requirements_service.requires_verification?(permission, user)
      return USER_DENIED_REASONS[:user_not_in_group] if denied_when_permitted_by_groups?(permission, user)

      nil
    end

    def denied_when_permitted_by_groups?(permission, user)
      permission.permitted_by == 'groups' && permission.groups && !user.in_any_groups?(permission.groups)
    end

    def user_requirements_service
      @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups: false)
    end

    def user_can_moderate_something?(user)
      @user_can_moderate_something ||= (user.admin? || UserRoleService.new.moderates_something?(user))
    end
  end
end
