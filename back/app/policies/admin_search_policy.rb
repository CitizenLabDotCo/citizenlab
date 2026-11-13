# frozen_string_literal: true

# The admin quick search lists the places a user manages, so only users who
# manage something can use it.
class AdminSearchPolicy < ApplicationPolicy
  def index?
    return false unless user&.active?

    UserRoleService.new.moderates_something?(user)
  end
end
