# frozen_string_literal: true

class BasketPolicy < ApplicationPolicy
  def create?
    user&.active? &&
      (record.user_id == user.id) &&
      record.phase &&
      ProjectPolicy.new(user, record.phase.project).show? &&
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
    pcs = Permissions::PermissionsService.new
    current_phase = TimelineService.new.current_phase_not_archived basket.phase.project
    !pcs.denied_reason_for_phase current_phase, user, 'voting'
  end
end
