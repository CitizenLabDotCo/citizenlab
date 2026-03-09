class SpacePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope = scope.includes(:folders, :projects)

      # TODO: Include space admins/managers here once those roles are implemented
      active_admin? ? scope.all : scope.none
    end
  end

  def show?
    # TODO: Include space admins/managers here once those roles are implemented
    active_admin?
  end

  def index?
    # TODO: Include space admins/managers here once those roles are implemented
    active_admin?
  end

  def create?
    active_admin?
  end

  def update?
    active_admin?
  end

  def destroy?
    active_admin?
  end

  def tree_view?
    active_admin?
  end
end
