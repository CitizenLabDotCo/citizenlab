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

  def show?
    active? && (owner? || admin?)
  end

  def create?
    return false if !could_modify?

    reason = participation_context_service.idea_voting_disabled_reason_for record, user
      
    reason ? raise_not_authorized(reason) : true
  end

  def up?
    return false if !could_modify?

    reason = participation_context_service.idea_upvoting_disabled_reason_for record, user
    reason ||= participation_context_service.cancelling_votes_disabled_reason_for_idea record.votable, user

    reason ? raise_not_authorized(reason) : true
  end

  def down? 
    return false if !could_modify?

    reason = participation_context_service.idea_downvoting_disabled_reason_for record, user
    reason ||= participation_context_service.cancelling_votes_disabled_reason_for_idea record.votable, user

    reason ? raise_not_authorized(reason) : true
  end

  def destroy?
    return false if !could_modify?

    reason = participation_context_service.cancelling_votes_disabled_reason_for_idea record.votable, user

    reason ? raise_not_authorized(reason) : true
  end

  private

  def could_modify?
    active? && owner? && record.votable.present?
  end

  def participation_context_service
    @participation_context_service ||= ParticipationContextService.new
  end
end
