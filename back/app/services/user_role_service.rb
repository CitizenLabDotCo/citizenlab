class UserRoleService

  def moderators_for object, scope=User
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

  def moderators_for_project project, scope=User
    scope.admin
      .or(scope.project_moderator(project.id))
  end
end

UserRoleService.prepend_if_ee('ProjectFolders::Patches::UserRoleService')
