class ProjectsListedScopeService
  def self.remove_unlisted_projects(projects_scope)
    projects_scope.where(listed: true)
  end

  def self.remove_unlisted_that_user_cannot_moderate(
    projects_scope,
    user
  )
    # Admins: return all projects,
    # since they can moderate all projects.
    if user&.admin?
      return projects_scope
    end

    # Moderators: return all projects that
    # they can moderate.
    if user&.project_or_folder_moderator?
      projects_scope = projects_scope.joins(:admin_publication)

      return projects_scope.where(
        '(projects.listed = TRUE) OR ' \
        '(projects.listed = FALSE AND projects.id IN (?)) OR ' \
        '(projects.listed = FALSE AND admin_publications.parent_id IN (?))',
        user.moderatable_project_ids,
        AdminPublication.where(publication_id: user.moderated_project_folder_ids).select(:id)
      )
    end

    # Other users: return only listed projects.
    projects_scope.where(listed: true)
  end
end
