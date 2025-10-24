class ProjectsListedScopeService
  def self.call(projects_scope, user, remove_unlisted_type)
    # remove_unlisted_type can be:
    # - 'remove_all_unlisted': only return listed projects
    # - 'remove_unlisted_that_user_cannot_moderate': return listed projects
    # AND unlisted projects that the user can moderate.

    if remove_unlisted_type == 'remove_all_unlisted'
      return projects_scope.where(listed: true)
    end

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