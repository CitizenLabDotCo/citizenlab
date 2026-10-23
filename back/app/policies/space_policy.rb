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
    active_admin? || user&.moderator?
  end

  def index?
    active_admin? || user&.space_moderator?
  end

  def create?
    active_admin?
  end

  def update?
    can_moderate?
  end

  # The order of the spaces is shared by every admin, so only admins change it.
  def reorder?
    active_admin?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

  def destroy?
    active_admin?
  end
end
