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
    (user&.active? && (record.user_id == user.id) && !ParticipationContextService.new.voting_disabled_reason_for_comment(record.votable, user))
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

end
