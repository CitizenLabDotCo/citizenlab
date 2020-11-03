class AdminPublicationsFilteringService
  include Filterer

  add_filter("by_publication_status") do |scope, options|
    return scope unless (publication_status = options[:publication_status])
    scope.where(publication_status: publication_status)
  end

  add_filter("filter_projects") do |scope, options|
    projects = scope.where(publication_type: Project.name).pluck(:publication)
    filtered_projects = ProjectsFilteringService.new.filter(projects, options)

    project_publications = scope.where(publication: filtered_projects)
    other_publications = scope.where.not(publication_type: Project.name)
    project_publications.or(other_publications)
  end

  add_filter("remove_empty_folders") do |scope, options|
    return scope unless options[:filter_empty_folders]
    folders_to_keep = scope.pluck(:parent_id).compact.uniq

    non_folders = scope.where.not(publication_type: ProjectFolders::Folder.name)
    filtered_folders = scope.where(id: folders_to_keep, publication_type: ProjectFolders::Folder.name)
    filtered_folders.or(non_folders)
  end

  add_filter("by_folder") do |scope, options|
    return scope unless options.key? :folder

    folder_id = options[:folder]
    if folder_id.nil?
      scope.where(parent_id: nil) # keeps on top-level publications
    else
      folder = AdminPublication.where(publication_id: folder_id, publication_type: ProjectFolders::Folder.name)
      scope.where(parent_id: folder).or(folder)
    end
  end

end
