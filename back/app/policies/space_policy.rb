class SpacePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope = scope.includes(:folders, :projects)

      if active_admin?
        return @scope.all
      end

      if user.space_moderator?
        return @scope.where(id: user.moderated_space_ids)
      end

      @scope.none
    end
  end

  def show?
    user && UserRoleService.new.can_moderate?(record, user)
  end

  def index?
    active_admin? || user && user.space_moderator?
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
end
