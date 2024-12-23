# frozen_string_literal: true

class BasketPolicy < ApplicationPolicy
  def create?
    user&.active? &&
      (record.user_id == user.id) &&
      record.phase &&
      policy_for(record.phase.project).show? &&
      check_voting_allowed(record, user)
  end

  def show?
    user&.active? && record.user_id == user.id
  end

  # NOTE: If we change any of these, we also need to change BasketsIdeaPolicy
  def update?
    create?
  end

  def upsert?
    update?
  end

  def destroy?
    update?
  end

  private

  def check_voting_allowed(basket, user)
    current_phase = TimelineService.new.current_phase_not_archived basket.phase.project
    !Permissions::PhasePermissionsService.new(current_phase, user).denied_reason_for_action 'voting'
  end
end
