class ProjectSortingService

  def sort projects_sope
    if Tenant.current.has_feature? 'manual_project_sorting'
      projects_sope
        .publication_status_ordered
        .order(:ordering)
    else
      projects_sope
    end
  end

end