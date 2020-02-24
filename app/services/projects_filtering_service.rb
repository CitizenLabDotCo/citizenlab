class ProjectsFilteringService

  def apply_common_index_filters projects_scope, params
    if params[:publication_statuses].present?
      projects_scope = projects_scope.where(publication_status: params[:publication_statuses])
    end
    if params[:areas].present?
      projects_scope = projects_scope.with_some_areas(params[:areas])
        .or(projects_scope.without_areas)
    end
    projects_scope = projects_scope.with_all_topics(params[:topics]) if params[:topics].present?
    projects_scope
  end
end
