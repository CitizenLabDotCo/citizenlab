class IdeaVotePolicy < ApplicationPolicy

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
    (user&.active? && (record.user_id == user.id) && check_changing_votes_allowed(record, user))
  end

  def destroy?
    (user&.active? && (record.user_id == user.id) && check_cancelling_votes_allowed(record, user))
  end


  private

  def check_changing_votes_allowed vote, user
    check_voting_allowed(vote, user) && check_cancelling_votes_allowed(vote, user)
  end

  def check_voting_allowed vote, user
    pcs = ParticipationContextService.new
    # Not using voting_disabled_reason_for_idea because
    # voting_disabled_reason_for_idea_vote also checks if
    # downvoting is disabled (and therefore needs the
    # vote object).
    vote.votable && !pcs.voting_disabled_reason_for_idea_vote(vote, user)
  end

  def check_cancelling_votes_allowed vote, user
    pcs = ParticipationContextService.new

    idea = vote.votable
    idea && !pcs.cancelling_votes_disabled_reason_for_idea(idea, user)
  end

end
