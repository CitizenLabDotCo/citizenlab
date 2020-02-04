class ProjectHolderService

  def fix_project_holder_orderings!
    folder_ids = ProjectFolder.ids
    missing_folder_ids = folder_ids - ProjectHolderOrdering.where(project_holder_type: 'ProjectFolder').where(project_holder_id: folder_ids).ids
    ProjectHolderOrdering.create!(missing_folder_ids.map{|id| 
      {project_holder_id: id, project_holder_type: 'ProjectFolder'}
    })
    ProjectHolderOrdering.where(project_holder_type: 'ProjectFolder').where.not(project_holder_id: folder_ids).destroy_all

    project_ids = Project.where('folder_id IS NULL').published.ids
    missing_project_ids = project_ids - ProjectHolderOrdering.where(project_holder_type: 'Project').where(project_holder_id: project_ids).ids
    ProjectHolderOrdering.create!(missing_project_ids.map{|id| 
      {project_holder_id: id, project_holder_type: 'Project'}
    })
    ProjectHolderOrdering.where(project_holder_type: 'Project').where.not(project_holder_id: project_ids).destroy_all
  end

end