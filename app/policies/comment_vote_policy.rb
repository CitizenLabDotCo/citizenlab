class CommentVotePolicy < ApplicationPolicy

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
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def create?
    (user&.active? && (record.user_id == user.id) && can_create_comment?)
  end

  def show?
    (user&.active? && (record.user_id == user.id || user.admin?))
  end

  def up?
    create?
  end

  def down?
    create?
  end

  def destroy?
    create?
  end

  private

  def can_create_comment?
    Pundit.policy!(user, Comment.new(author: user, post: record.votable.post)).create?
  end

end
