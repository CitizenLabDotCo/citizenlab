class IdeaOfficialFeedbackPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(feedback_item: Pundit.policy_scope(user, Idea))
    end
  end

  def create? 
    user&.active_admin_or_moderator?(record.feedback_item.project.id)
  end

  def show?
    IdeaPolicy.new(user, record.feedback_item).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

end
