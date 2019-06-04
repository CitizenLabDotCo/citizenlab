class IdeaOfficialFeedbackPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(vettable: Pundit.policy_scope(user, Idea))
    end
  end

  def create? 
    user&.active_admin_or_moderator?(record.vettable.project.id)
  end

  def show?
    IdeaPolicy.new(user, record.vettable).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

end
