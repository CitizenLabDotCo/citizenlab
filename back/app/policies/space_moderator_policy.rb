class SpaceModeratorPolicy < ApplicationPolicy
  def index?
    active_and_can_moderate?
  end

  # def show?
  #   admin_or_moderator?
  # end

  # def create?
  #   admin_or_moderator?
  # end

  # def destroy?
  #   admin_or_moderator?
  # end

  # def users_search?
  #   admin_or_moderator?
  # end

  private

  # TODO: simple version for now
  def active_and_can_moderate?
    user&.active? && UserRoleService.new.can_moderate?(Space.find_by(id: record.space_id), user)
  end
end
