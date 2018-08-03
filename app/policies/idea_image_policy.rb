class IdeaImagePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      idea_ids = Pundit.policy_scope(user, Idea).pluck(:id)
      scope.where(idea_id: idea_ids)
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
