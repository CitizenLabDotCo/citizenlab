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
    user&.active? &&
      (record.user_id == user.id) &&
      record.phase &&
      policy_for(record.phase.project).show? &&
      check_basket_update_allowed(record, user)
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

  # Note we check voting allowed differently on update
  # We allow updates if the basket is already submitted and 'user_not_in_group' reason is given
  # Because if smart groups are enabled based on voting (submitted) it can stop the user being able modify their votes
  def check_basket_update_allowed(basket, user)
    current_phase = TimelineService.new.current_phase_not_archived basket.phase.project
    reason = Permissions::PhasePermissionsService.new(current_phase, user).denied_reason_for_action 'voting'

    return true if reason == 'user_not_in_group' && basket.submitted?

    !reason
  end
end
