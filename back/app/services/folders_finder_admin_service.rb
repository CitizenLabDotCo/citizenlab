class FoldersFinderAdminService
  def self.execute(scope, params)
    folders = filter_status(scope, params)
    folders = filter_folder_manager(folders, params)
    folders = search(folders, params)

    folders
      .order('project_folders_folders.created_at DESC, project_folders_folders.id ASC')
  end

  # FILTERING METHODS
  def self.filter_status(scope, params = {})
    status = params[:status] || []
    return scope if status.blank?

    scope
      .joins(:admin_publications)
      .where(admin_publications: { publication_type: 'ProjectFolders::Folder', publication_status: status })
  end

  def self.filter_folder_manager(scope, params = {})
    manager_ids = params[:managers] || []
    return scope if manager_ids.blank?

    managers = User.where(id: manager_ids)
    
    moderated_folders = managers.flat_map do |manager|
      manager.roles.select { |role| role['type'] == 'project_folder_moderator' }.map do
        |role| role['project_folder_id']
      end
    end

    scope.where(id: moderated_folders)
  end

  def self.search(scope, params = {})
    search = params[:search] || ''
    return scope if search.blank?

    scope.search_by_title(search)
  end
end
