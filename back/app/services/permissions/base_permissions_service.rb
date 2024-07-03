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
      @timeline_service = TimelineService.new
    end

    private

    def supported_action?(action)
      return true if SUPPORTED_ACTIONS.include? action

      raise "Unsupported action: #{action}"
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
