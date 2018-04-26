class ModeratorPolicy < ApplicationPolicy

  # def index?
  #   admin_or_moderator?
  # end

  def show?
    admin_or_moderator?
  end

  def create?
    admin_or_moderator?
  end

  def delete?
    admin_or_moderator?
  end


  private

  def admin_or_moderator?
    user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end

end
