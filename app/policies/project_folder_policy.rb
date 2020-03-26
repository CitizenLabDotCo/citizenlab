class ProjectFolderPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      else
        scope.left_outer_joins(:admin_publication)
          .where(admin_publications: {publication_status: ['published', 'archived']})
      end
    end
  end

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
