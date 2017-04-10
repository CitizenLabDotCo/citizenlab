class CommentPolicy < ApplicationPolicy
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
    user && record.author_id == user.id
  end

  def show?
    true
  end

  def update?
    user && record.author_id == user.id
  end

  def destroy?
    update?
  end


end
