# frozen_string_literal: true

class UserRoleService
  def can_moderate?(object, user)
    return true if user.admin?

    case object.class.name
    when 'Idea'
      can_moderate? object.project, user
    when 'Initiative'
      can_moderate_initiatives? user
    when 'Comment', 'OfficialFeedback'
      can_moderate? object.post, user
    when 'Vote'
      can_moderate? object.votable, user
    when 'Project'
      can_moderate_project? object, user
    when 'Phase'
      can_moderate_project? object.project, user
    end
  end

  def can_moderate_initiatives?(user)
    user.admin?
  end

  def can_moderate_project?(project, user)
    user.admin? || (project.persisted? && user.project_moderator?(project.id))
  end

  def moderators_for(object, scope = User)
    case object.class.name
    when 'Idea'
      moderators_for object.project, scope
    when 'Initiative'
      scope.admin
    when 'Comment'
      moderators_for object.post, scope
    when 'Project'
      moderators_for_project object, scope
    when 'Phase'
      moderators_for_project object.project, scope
    end
  end

  def moderators_for_project(project, scope = User)
    if project.id
      scope.admin.or scope.project_moderator(project.id)
    else
      scope.admin
    end
  end

  def moderatable_projects(user, scope = Project)
    if user.admin?
      scope.all
    elsif user.project_moderator?
      scope.where(id: user.moderatable_project_ids)
    else
      scope.none
    end
  end

  def moderates_something?(user)
    user.admin? || user.project_moderator?
  end
end

UserRoleService.prepend_if_ee 'ProjectFolders::Patches::UserRoleService'
