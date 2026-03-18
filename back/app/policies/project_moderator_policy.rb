# frozen_string_literal: true

class ProjectModeratorPolicy < ApplicationPolicy
  def index?
    admin_or_moderator?
  end

  def show?
    admin_or_moderator?
  end

  def create?
    admin_or_moderator?
  end

  def destroy?
    admin_or_moderator?
  end

  def users_search?
    admin_or_moderator?
  end

  private

  def admin_or_moderator?
    return false unless user&.active?

    user.admin? || UserRoleService.new.can_moderate?(record, user)
  end
end
