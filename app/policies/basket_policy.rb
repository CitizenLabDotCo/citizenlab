class BasketPolicy < ApplicationPolicy
  def create?
    (
      user&.active? && 
      (record.user_id == user.id) &&
      ProjectPolicy.new(user, record.participation_context.project).show? &&
      check_budgeting_allowed(record, user)
    ) || 
    user&.active_admin_or_moderator?(record.participation_context.project.id)
  end

  def show?
    user&.active? && (record.user_id == user.id || user&.active_admin_or_moderator?(record.participation_context.project.id))
  end

  def update?
    create?
  end

  def destroy?
    update?
  end


  private

  def check_budgeting_allowed basket, user
    pcs = ParticipationContextService.new
    !pcs.budgeting_disabled_reason_for_context pcs.get_participation_context(basket.participation_context.project), user
  end
end
