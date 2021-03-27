# frozen_string_literal: true

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
    return unless active? && owner?
    return unless record.votable

    reason = participation_context_service.voting_disabled_reason_for_idea_vote(record, user)
    reason ? raise_not_authorized(reason) : true
  end

  def show?
    active? && (owner? || admin?)
  end

  def up?
    return unless active? && owner?
    return unless record.votable

    reason = changing_vote_disabled?(record)
    reason ? raise_not_authorized(reason) : true
  end

  def down? 
    up?
  end

  def destroy?
    return unless active? && owner?
    return unless (idea = record.votable)

    reason = participation_context_service.cancelling_votes_disabled_reason_for_idea(idea, user)
    reason ? raise_not_authorized(reason) : true
  end

  private

  def changing_vote_disabled?(vote)
    reason = participation_context_service.voting_disabled_reason_for_idea_vote(vote, user)
    if (idea = vote.votable)
      reason ||= participation_context_service.cancelling_votes_disabled_reason_for_idea(idea, user)
    end
    reason
  end

  def participation_context_service
    @participation_context_service ||= ParticipationContextService.new
  end
end
