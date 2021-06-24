class UserRoleService

  def moderators_for object
    case object.class
    when Idea
      moderators_for idea.project
    when Initiative
      User.admin
    when Comment
      moderators_for comment.post
    when Project
      User.admin_or_moderator?(project_id)
    end
  end

  def moderators_for_project project, scope=User
    scope.admin
      .or(scope.project_moderator(project.id))
  end
end

UserRoleService.prepend_if_ee('ProjectFolders::Patches::UserRoleService')
