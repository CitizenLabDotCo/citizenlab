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
      not_signed_in: 'not_signed_in',
      not_active: 'not_active',
      not_permitted: 'not_permitted',
      not_in_group: 'not_in_group',
      missing_user_requirements: 'missing_user_requirements',
      not_verified: 'not_verified',
      blocked: 'blocked'
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
      if permission.permitted_by == 'everyone'
        user ||= User.new
      else
        return USER_DENIED_REASONS[:not_signed_in] unless user
        return USER_DENIED_REASONS[:blocked] if user.blocked?

        unless user.confirmation_required? # Ignore non confirmed users as this will be picked up by UserRequirementsService
          return USER_DENIED_REASONS[:not_active] unless user.active?
          return if UserRoleService.new.can_moderate? scope, user
          return USER_DENIED_REASONS[:not_permitted] if permission.permitted_by == 'admins_moderators'

          if permission.permitted_by == 'groups'
            reason = denied_when_permitted_by_groups?(permission, user)
            return USER_DENIED_REASONS[reason] if reason.present?
          end
        end
      end
      return if user_requirements_service.requirements(permission, user)[:permitted]

      USER_DENIED_REASONS[:missing_user_requirements]
    end

    # NOTE: method overridden in the verification engine
    def denied_when_permitted_by_groups?(permission, user)
      :not_in_group unless permission.groups && user.in_any_groups?(permission.groups)
    end

    def user_requirements_service
      @user_requirements_service ||= Permissions::UserRequirementsService.new
    end

    def user_can_moderate_something?(user)
      @user_can_moderate_something ||= (user.admin? || UserRoleService.new.moderates_something?(user))
    end
  end
end

Permissions::BasePermissionsService.prepend(Verification::Patches::Permissions::BasePermissionsService)
