# frozen_string_literal: true

class BasketPolicy < ApplicationPolicy
  def create?
    user&.active? &&
      (record.user_id == user.id) &&
      record.phase &&
      policy_for(record.phase.project).show? &&
      !voting_disabled_reason(record, user)
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
      !basket_update_disabled_reason(record, user)
  end

  def upsert?
    update?
  end

  def destroy?
    update?
  end

  private

  def voting_disabled_reason(basket, user)
    current_phase = TimelineService.new.current_phase_not_archived basket.phase.project
    Permissions::PhasePermissionsService.new(current_phase, user).denied_reason_for_action 'voting'
  end

  # Note we check voting allowed differently on update
  # We allow updates if the basket is already submitted and 'user_not_in_group' reason is given
  # Because if smart groups are enabled based on voting (submitted) it can stop the user being able modify their votes
  def basket_update_disabled_reason(basket, user)
    reason = voting_disabled_reason(basket, user)
    return nil if reason == 'user_not_in_group' && basket.submitted?

    reason
  end
end
