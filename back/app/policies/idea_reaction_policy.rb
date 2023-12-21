# frozen_string_literal: true

class IdeaReactionPolicy < ApplicationPolicy
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
    return false unless could_modify?

    reason = participation_context_service.idea_reacting_disabled_reason_for record, user

    reason ? raise_not_authorized(reason) : true
  end

  def up?
    upsert_reaction? 'up'
  end

  def down?
    upsert_reaction? 'down'
  end

  def destroy?
    return false unless could_modify?

    reason = participation_context_service.cancelling_reacting_disabled_reason_for_idea record.reactable, user

    reason ? raise_not_authorized(reason) : true
  end

  private

  def could_modify?
    active? && owner? && record.reactable.present?
  end

  def upsert_reaction?(mode)
    return false unless could_modify?

    reason = participation_context_service.idea_reacting_disabled_reason_for record, user, mode: mode
    reason ||= participation_context_service.cancelling_reacting_disabled_reason_for_idea record.reactable, user

    reason ? raise_not_authorized(reason) : true
  end

  def participation_context_service
    @participation_context_service ||= ParticipationPermissionsService.new
  end
end
