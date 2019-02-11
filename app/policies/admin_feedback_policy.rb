class AdminFeedbackPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      idea_ids = Pundit.policy_scope(user, Idea).pluck(:id)
      scope.where(idea: idea_ids)
    end
  end

  def create? 
    user&.active_admin_or_moderator?(record.project.id)
  end

  def show?
    IdeaPolicy.new(user, record.idea).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

end
