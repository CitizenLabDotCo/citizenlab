class ProjectFolderPolicy < ApplicationPolicy
  def show?
    true
  end

  def by_slug?
    show?
  end

  def create?
    user&.active? && user.admin?
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    user&.active? && user.admin?
  end
end
