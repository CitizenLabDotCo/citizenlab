class PermissionPolicy < ApplicationPolicy
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
        scope.where(permittable_id: ParticipationContextService.new.moderating_participation_context_ids(user))
      else
        scope.none
      end
    end
  end

  def show?
    user&.active? && (user.admin? || user.project_moderator?(record.participation_context.project.id))
  end

  def update?
    user&.active? && (user.admin? || user.project_moderator?(record.participation_context.project.id))
  end

  def groups_inclusion?
    true
  end

end
