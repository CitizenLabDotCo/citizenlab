class ProjectsFilteringService

  def apply_common_index_filters projects_scope, params
    if params.key? :folder
      parent_scope = if params[:folder].present?
        AdminPublication.where(publication_id: params[:folder], publication_type: ProjectFolder.name)
      else # top-level projects
        nil 
      end
      projects_scope = projects_scope.left_outer_joins(:admin_publication)
        .where(admin_publications: {parent_id: parent_scope})
    end
    if params[:publication_statuses].present?
      projects_scope = projects_scope.left_outer_joins(:admin_publication)
        .where(admin_publications: {publication_status: params[:publication_statuses]})
    end
    if params[:areas].present?
      projects_scope = projects_scope.with_some_areas(params[:areas])
        .or(projects_scope.without_areas)
    end
    projects_scope = projects_scope.with_all_topics(params[:topics]) if params[:topics].present?
    projects_scope
  end
end
