class BasketPolicy < ApplicationPolicy
  def create?
    pcs = ParticipationContextService.new 
    (
      user&.active? && 
      (record.user_id == user.id) &&
      check_budgeting_allowed(record, user)
    ) || 
    user&.active_admin_or_moderator?(record.participation_context.project.id))
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


  def create?
    pcs = ParticipationContextService.new 
    record.draft? ||
    user&.active_admin_or_moderator?(record.project_id) ||
    (
      user&.active? &&
      record.author_id == user.id &&
      !pcs.posting_disabled_reason(record.project, user) &&
      ProjectPolicy.new(user, record.project).show?
    )
  end


  private

  def check_budgeting_allowed basket, user
    pcs = ParticipationContextService.new
    !pcs.budgeting_disabled_reason_in_context basket.participation_context, user
  end
end
