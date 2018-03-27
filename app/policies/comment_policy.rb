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
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def show?
    true
  end

  def update?
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def mark_as_deleted?
    user&.active? && (record.author_id == user.id || user.admin?)
  end

  def destroy?
    update?
  end


end
