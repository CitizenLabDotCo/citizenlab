# frozen_string_literal: true

class UserRoleService
  def can_moderate?(object, user)
    return true if user.admin?

    case object.class.name
    when 'Idea'
      can_moderate? object.project, user
    when 'Initiative'
      can_moderate_initiatives? user
    when 'OfficialFeedback'
      can_moderate? object.idea, user
    when 'Comment'
      can_moderate? object.post, user
    when 'Reaction'
      can_moderate? object.reactable, user
    when 'ProjectFolders::Folder'
      user.admin? || (object.id && user.project_folder_moderator?(object.id))
    when 'Project'
      can_moderate_project? object, user
    when 'Phase'
      can_moderate_project? object.project, user
    when 'Permission'
      context = object.permission_scope
      context ? can_moderate?(context, user) : user.admin?
    end
  end

  def can_moderate_initiatives?(user)
    user&.admin?
  end

  def can_moderate_project?(project, user)
    user.admin? ||
      (project.persisted? && user.project_moderator?(project.id)) ||
      (project.in_folder? && user.project_folder_moderator?(project.folder_id))
  end

  def moderators_for(object, scope = User)
    case object.class.name
    when 'Idea'
      moderators_for object.project, scope
    when 'Initiative'
      scope.admin
    when 'Comment'
      moderators_for object.post, scope
    when 'ProjectFolders::Folder'
      scope.admin.or(scope.project_folder_moderator(object.id))
    when 'Project'
      moderators_for_project object, scope
    when 'Phase'
      moderators_for_project object.project, scope
    when 'Permission'
      context = object.permission_scope
      context ? moderators_for(context, scope) : scope.admin
    end
  end

  # Includes admins, folder and project moderators
  def moderators_for_project(project, scope = User)
    moderators_scope = scope.admin
    moderators_scope = moderators_scope.or scope.project_moderator(project.id) if project.id
    moderators_scope = moderators_scope.or scope.project_folder_moderator(project.folder_id) if project.folder_id
    moderators_scope
  end

  def moderatable_projects(user, scope = Project)
    return scope.all if user.admin?

    moderatable_projects = scope.none
    if user.project_moderator?
      moderatable_projects = moderatable_projects.or(scope.where(id: user.moderatable_project_ids))
    end
    if user.project_folder_moderator?
      admin_publications = AdminPublication
        .joins(:parent)
        .where(parents_admin_publications: {
          publication_type: 'ProjectFolders::Folder',
          publication_id: user.moderated_project_folder_ids
        })
      moderatable_projects = moderatable_projects.or(scope.where(admin_publication: admin_publications))
    end
    moderatable_projects
  end

  def moderates_something?(user)
    user.admin? || user.project_moderator? || user.project_folder_moderator?
  end
end
