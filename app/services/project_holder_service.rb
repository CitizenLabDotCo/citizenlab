class ProjectHolderService

  def fix_project_holder_orderings!
    # Doing reverse on the missing IDs as a hack
    # to have a high likelihood of preserving
    # relative ordering amongst projects of a
    # deleted folder (which are moved to the top).
    folder_ids = ProjectFolder.ids
    missing_folder_ids = folder_ids - ProjectHolderOrdering.where(project_holder_type: 'ProjectFolder').where(project_holder_id: folder_ids).pluck(:project_holder_id)
    ProjectHolderOrdering.create!(missing_folder_ids.reverse.map{|id|
      {project_holder_id: id, project_holder_type: 'ProjectFolder'}
    })
    ProjectHolderOrdering.where(project_holder_type: 'ProjectFolder').where.not(project_holder_id: folder_ids).destroy_all

    project_ids = Project.where(folder_id: nil).order(:ordering).ids
    missing_project_ids = project_ids - ProjectHolderOrdering.where(project_holder_type: 'Project').where(project_holder_id: project_ids).pluck(:project_holder_id)
    ProjectHolderOrdering.create!(missing_project_ids.map{|id|
      {project_holder_id: id, project_holder_type: 'Project'}
    })
    ProjectHolderOrdering.where(project_holder_type: 'Project').where.not(project_holder_id: project_ids).destroy_all
  end

end
