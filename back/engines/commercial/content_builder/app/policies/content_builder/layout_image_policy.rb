# frozen_string_literal: true

module ContentBuilder
  class LayoutImagePolicy < ApplicationPolicy
    def create?
      # The content buildable is not provided and
      # so we cannot check if the user moderates
      # the corresponding context. Instead, we
      # check if the user has any moderation
      # rights.
      user&.active? && user_role_service.moderates_something?(user)
    end

    private

    def user_role_service
      @user_role_service ||= UserRoleService.new
    end
  end
end
