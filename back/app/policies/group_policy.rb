class GroupPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.active? && user.admin?
        scope.all
      elsif user&.active? && user.project_moderator?
        projects = Project.where(id: user.moderatable_project_ids)
        if projects.any?{|p| p.visible_to == 'public'}
          scope.all
        else projects.any?{|p| p.visible_to == 'groups'}
          project_ids = projects.select{|p| p.visible_to == 'groups'}
          group_ids = Group
            .joins(:groups_projects)
            .where(groups_projects: {project_id: project_ids})
          scope.where(id: group_ids)
        end
      else
        scope.none
      end
    end
  end

  def create?
    user&.active? && user.admin?
  end

  def show?
    user&.active? && (
      user.admin? ||
      user.project_moderator? && moderator_can_show?
    )
  end

  def by_slug?
    show?
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    user&.active? && user.admin?
  end

  private

  def moderator_can_show?
    projects = Project.where(id: user.moderatable_project_ids)
    if projects.any?{|p| p.visible_to == 'public'}
      true
    elsif projects.any?{|p| p.visible_to == 'groups'}
      project_ids = projects.select{|p| p.visible_to == 'groups'}
      GroupsProject.where(project_id: project_ids, group_id: record.id).exists?
    else
      false
    end
  end

end