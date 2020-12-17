class ModerationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.active? && user.admin?
        scope.all
      elsif user&.active? && user.project_moderator?
        projects = Project.where(id: user.moderatable_project_ids)
        scope.where(project_id: projects)
      else
        scope.none
      end
    end
  end

  def update?
   user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end
end