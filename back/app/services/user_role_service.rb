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

  def can_moderate_project?(project, user)
    user.admin? ||
      (project.persisted? && user.project_moderator?(project.id)) ||
      (project.in_folder? && user.project_folder_moderator?(project.folder_id))
  end

  def moderators_for(object, scope = User)
    case object.class.name
    when 'Idea'
      moderators_for object.project, scope
    when 'Comment'
      moderators_for object.idea, scope
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
    return scope.none unless user
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

  # Returns a hash with project IDs as keys and arrays of users as values
  def moderators_per_project(project_ids)
    return {} if project_ids.empty?

    project_ids_array = project_ids.map { |id| "'#{id}'" }.join(', ')
    users = User.where(<<~SQL.squish)
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(roles) AS role
        WHERE role->>'type' = 'project_moderator'
          AND role->>'project_id' IN (#{project_ids_array})
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

    folder_ids_array = folder_ids.map { |id| "'#{id}'" }.join(', ')
    users = User.where(<<~SQL.squish)
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(roles) AS role
        WHERE role->>'type' = 'project_folder_moderator'
          AND role->>'project_folder_id' IN (#{folder_ids_array})
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
