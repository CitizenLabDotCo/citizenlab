class ProjectHolderService

  def fix_project_holder_orderings!
    folder_ids = ProjectFolder.ids
    ProjectHolderOrdering.create(folder_ids.map{|id| {project_holder_id: id, project_holder_type: 'ProjectFolder'}})
    ProjectHolderOrdering.where(project_holder_type: 'ProjectFolder').where.not(project_holder_id: folder_ids).destroy_all

    project_ids = Project.where('folder_id IS NULL').published.ids
    ProjectHolderOrdering.create(project_ids.map{|id| {project_holder_id: id, project_holder_type: 'Project'}})
    ProjectHolderOrdering.where(project_holder_type: 'Project').where.not(project_holder_id: project_ids).destroy_all
  end

end