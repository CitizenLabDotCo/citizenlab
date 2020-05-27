class ProjectsTopicPolicy < ApplicationPolicy
  def create?
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
  end

  def destroy?
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
  end
end
