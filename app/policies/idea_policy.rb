class IdeaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def create?
    record.draft? || user
  end

  def show?
    true
  end

  def update?
    record.draft? || (user && (record.author_id == user.id || user.admin?))
  end

  def destroy?
    update?
  end


end
