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

  def can_moderate_project?(_project, user)
    user.admin?
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
    end
  end

  def moderators_for_project(_project, scope = User)
    scope.admin
  end

  def moderatable_projects(user, scope = Project)
    if user.admin?
      scope.all
    else
      scope.none
    end
  end

  def moderates_something?(user)
    user.admin?
  end
end

UserRoleService.prepend_if_ee 'ProjectManagement::Patches::UserRoleService'
UserRoleService.prepend_if_ee 'ProjectFolders::Patches::UserRoleService'
