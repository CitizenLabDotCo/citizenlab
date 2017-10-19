class ProjectPolicy < ApplicationPolicy
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
        scope.left_outer_joins(groups: :memberships)
          .where("memberships.user_id = ? OR groups_projects.group_id IS NULL", user&.id)
      end
    end
  end

  def create?
    user && user.admin?
  end

  def images_index?
    show?
  end

  def show?
    user&.admin? ||
    record.groups_projects.empty? || 
    record.groups.includes(:memberships).flat_map(&:memberships).any?{|m| m.user_id == user.id}
  end

  def by_slug?
    show?
  end

  def update?
    user && (user.admin? || user.project_moderator?(record.id))
  end

  def destroy?
    update?
  end
end
