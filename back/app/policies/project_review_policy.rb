# frozen_string_literal: true

class ProjectReviewPolicy < ApplicationPolicy
  def create?
    return false unless active?

    can_moderate_project? && record.requester == user
  end

  def show?
    return false unless active?

    can_moderate_project?
  end

  def update?
    return false unless active?

    can_approve? && record.reviewer == user
  end

  def destroy?
    return false unless active?

    can_approve? || (record.requester == user && can_moderate_project?)
  end

  private

  def can_approve?
    admin? || can_moderate_folder?
  end

  def can_moderate_project?
    UserRoleService.new.can_moderate?(record.project, user)
  end

  def can_moderate_folder?
    folder = record.project.folder
    folder.present? && UserRoleService.new.can_moderate?(folder, user)
  end
end
