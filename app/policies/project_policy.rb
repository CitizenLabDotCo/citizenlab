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
      elsif user
        scope
          .left_outer_joins(groups: :memberships)
          .where("projects.visible_to = 'public' OR \
            (projects.visible_to = 'groups' AND memberships.user_id = ?)", user&.id)
      else
        scope
          .where(visible_to: 'public')
      end
    end
  end

  def create?
    user && user.admin?
  end

  def images_index?
    show?
  end

  def files_index?
    show?
  end

  def show?
    user&.admin? ||
    record.visible_to == 'public' || 
    record.visible_to == 'groups' && record.groups.includes(:memberships).flat_map(&:memberships).any?{|m| m.user_id == user.id}
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
