class SpaceModeratorPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.space_moderator?
        scope.where(id: user.moderated_space_ids)
      elsif user&.active? && user.admin?
        scope.all
      else
        raise Pundit::NotAuthorizedError, 'not allowed to view this action'
      end
    end
  end

  def index?
    user&.active? && (user.admin? || user.space_moderator?)
  end

  def show?
    active_and_can_moderate?
  end

  def create?
    user&.active? && user.admin?
  end

  def destroy?
    user&.active? && user.admin?
  end

  private

  # TODO: simple version for now
  def active_and_can_moderate?
    user&.active? && UserRoleService.new.can_moderate?(Space.find_by(id: record.id), user)
  end
end
