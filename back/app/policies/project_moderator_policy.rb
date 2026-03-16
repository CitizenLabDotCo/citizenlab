# frozen_string_literal: true

class ProjectModeratorPolicy < ApplicationPolicy
  def index?
    active_and_can_moderate?
  end

  def show?
    active_and_can_moderate?
  end

  def create?
    active_and_can_moderate?
  end

  def destroy?
    active_and_can_moderate?
  end

  def users_search?
    active_and_can_moderate?
  end

  private

  def active_and_can_moderate?
    user&.active? && UserRoleService.new.can_moderate?(Project.find_by(id: record.project_id), user)
  end
end
