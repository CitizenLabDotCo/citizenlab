class SpaceModeratorPolicy < ApplicationPolicy
  def index?
    admin_or_moderator?
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
  def admin_or_moderator?
    user&.active? && user.admin?
  end
end
