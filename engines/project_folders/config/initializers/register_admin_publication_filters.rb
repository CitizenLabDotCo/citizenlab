
ProjectFolders::Engine::config.to_prepare do

  AdminPublicationsFilteringService.add_filter("remove_empty_folders") do |scope, options|
    next scope unless options[:filter_empty_folders]
    folders_to_keep = scope.pluck(:parent_id).compact.uniq

    non_folders = scope.where.not(publication_type: ProjectFolders::Folder.name)
    filtered_folders = scope.where(id: folders_to_keep, publication_type: ProjectFolders::Folder.name)
    filtered_folders.or(non_folders)
  end

  AdminPublicationsFilteringService.add_filter("compute_visible_children_counts") do |scope, _|
    # todo: this is a workaround (not a filter) to compute @children_counts before the 'by_folder' filter.
    # It must be done before bc when keeping only top-level publications (by_folder with folder == ""), the
    # children counts cannot be longer properly computed ex post.
    @children_counts = Hash.new(0).tap do |counts|
      parent_ids = scope.pluck(:parent_id).compact
      parent_ids.each { |id| counts[id] += 1 }
    end
    scope
  end

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