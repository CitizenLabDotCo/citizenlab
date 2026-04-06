# frozen_string_literal: true

class UserRoleService
  def can_moderate?(object, user)
    return true if user.admin?

    case object.class.name
    when 'Idea'
      can_moderate? object.project, user
    when 'Comment', 'OfficialFeedback'
      can_moderate? object.idea, user
    when 'Reaction'
      can_moderate? object.reactable, user
    when 'ProjectFolders::Folder'
      user.admin? ||
        (object.id && user.project_folder_moderator?(object.id)) ||
        (object.space_id && user.space_moderator?(object.space_id))
    when 'Project'
      can_moderate_project? object, user
    when 'Phase'
      can_moderate_project? object.project, user
    when 'Permission'
      context = object.permission_scope
      context ? can_moderate?(context, user) : user.admin?
    when 'Space'
      user.admin? || (object.id && user.space_moderator?(object.id))
    end
  end

  def can_moderate_project?(project, user)
    user.admin? ||
      (project.persisted? && user.project_moderator?(project.id)) ||
      (project.in_folder? && user.project_folder_moderator?(project.folder_id)) ||
      (project.space_id && user.space_moderator?(project.space_id)) ||
      false # Avoid returning nil if a condition evaluates to nil
  end

  def moderators_for(object, scope = User)
    case object.class.name
    when 'Idea'
      moderators_for object.project, scope
    when 'Comment'
      moderators_for object.idea, scope
    when 'ProjectFolders::Folder'
      moderators = scope.admin.or(scope.project_folder_moderator(object.id))
      moderators = moderators.or(scope.space_moderator(object.space_id)) if object.space_id
      moderators
    when 'Project'
      moderators_for_project object, scope
    when 'Phase'
      moderators_for_project object.project, scope
    when 'Permission'
      context = object.permission_scope
      context ? moderators_for(context, scope) : scope.admin
    end
  end

  # Includes admins, project, folder and space moderators
  def moderators_for_project(project, scope = User)
    moderators_scope = scope.admin
    moderators_scope = moderators_scope.or scope.project_moderator(project.id) if project.id
    moderators_scope = moderators_scope.or scope.project_folder_moderator(project.folder_id) if project.folder_id
    moderators_scope = moderators_scope.or scope.space_moderator(project.space_id) if project.space_id
    moderators_scope
  end

  def moderatable_projects(user, scope = Project)
    return scope.none unless user
    return scope.all if user.admin?

    if user.project_moderator? || user.project_folder_moderator? || user.space_moderator?
      scope.where(id: user.moderatable_project_ids)
    else
      scope.none
    end
  end

  def moderatable_folders(user, scope = ProjectFolders::Folder)
    return scope.none unless user
    return scope.all if user.admin?

    if user.project_folder_moderator? || user.space_moderator?
      scope.where(id: user.moderatable_folder_ids)
    else
      scope.none
    end
  end

  def moderates_something?(user)
    user.admin? || user.project_moderator? || user.project_folder_moderator? || user.space_moderator?
  end

  # Returns a hash with project IDs as keys and arrays of users as values
  def moderators_per_project(project_ids)
    return {} if project_ids.empty?

    users = User.where(<<~SQL.squish, project_ids)
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(roles) AS role
        WHERE role->>'type' = 'project_moderator'
          AND role->>'project_id' = ANY (ARRAY[?]::varchar[])
      )
    SQL

    users.each_with_object({}) do |user, hash|
      user.roles.each do |role|
        next unless role['type'] == 'project_moderator'

        project_id = role['project_id']
        next unless project_id && project_ids.include?(project_id)

        hash[project_id] ||= []
        hash[project_id] << user
      end
    end
  end

  # Returns a hash with folder IDs as keys and arrays of users as values
  def moderators_per_folder(folder_ids)
    return {} if folder_ids.empty?

    users = User.where(<<~SQL.squish, folder_ids)
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(roles) AS role
        WHERE role->>'type' = 'project_folder_moderator'
          AND role->>'project_folder_id' = ANY(ARRAY[?]::varchar[])
      )
    SQL

    users.each_with_object({}) do |user, hash|
      user.roles.each do |role|
        next unless role['type'] == 'project_folder_moderator'

        folder_id = role['project_folder_id']
        next unless folder_id && folder_ids.include?(folder_id)

        hash[folder_id] ||= []
        hash[folder_id] << user
      end
    end
  end
end
