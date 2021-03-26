class IdeaFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(idea: Pundit.policy_scope(user, Idea))
    end
  end

  def create?
    IdeaPolicy.new(user, record.idea).update?
  end

  def show?
    IdeaPolicy.new(user, record.idea).show?
  end

  def update?
    IdeaPolicy.new(user, record.idea).update?
  end

  def destroy?
    IdeaPolicy.new(user, record.idea).update?
  end

end
