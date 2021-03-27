
ProjectFolders::Engine::config.to_prepare do
  AdminPublicationsFilteringService.add_filter("by_folder") do |scope, options|
    next scope unless options.key? :folder

    folder_id = options[:folder]
    if folder_id.blank?
      scope.where(parent_id: nil) # keeps on top-level publications
    else
      folder = AdminPublication.where(publication_id: folder_id, publication_type: ProjectFolders::Folder.name)
      scope.where(parent_id: folder)  # .or(folder) Maybe we should add the folder itself
    end
  end
end
