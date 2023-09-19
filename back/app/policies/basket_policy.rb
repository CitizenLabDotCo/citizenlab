# frozen_string_literal: true

class BasketPolicy < ApplicationPolicy
  def create?
    user&.active? &&
      (record.user_id == user.id) &&
      ProjectPolicy.new(user, record.participation_context.project).show? &&
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
    pcs = ParticipationContextService.new
    !pcs.voting_disabled_reason_for_context pcs.get_participation_context(basket.participation_context.project), user
  end
end
