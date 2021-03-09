class InitiativeVotePolicy < ApplicationPolicy

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
    (user&.active? && (record.user_id == user.id) && check_voting_allowed(record, user))
  end

  def show?
    (user&.active? && (record.user_id == user.id || user.admin?))
  end

  def up?
    (user&.active? && (record.user_id == user.id) && check_changing_votes_allowed(record, user))
  end

  def down?
    false
  end

  def destroy?
    (user&.active? && (record.user_id == user.id) && check_cancelling_votes_allowed(record, user))
  end

  private

  def check_changing_votes_allowed vote, user
    check_voting_allowed(vote, user) && check_cancelling_votes_allowed(vote, user)
  end

  def check_voting_allowed(_vote, user)
    !PermissionsService.new.denied?(user, 'voting_initiative')
  end
  alias_method :check_cancelling_votes_allowed, :check_voting_allowed
end
