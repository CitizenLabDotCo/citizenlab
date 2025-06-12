class FoldersFinderAdminService
  def self.execute(scope, params)
    # TODO
    scope
  end

  # FILTERING METHODS
  def self.filter_status(scope, params = {})
    status = params[:status] || []
    return scope if status.blank?

    scope
      .joins("INNER JOIN admin_publications ON admin_publications.publication_id = project_folders_folders.id AND admin_publications.publication_type = 'ProjectFolders::Folder'")
      .where(admin_publications: { publication_status: status })
  end

  def self.filter_folder_manager(scope, params = {})
    manager_ids = params[:managers] || []
    return scope if manager_ids.blank?

    managers = User.where(id: manager_ids)
    moderated_folders = []

    managers.each do |manager|
      manager.roles.each do |role|
        if role['type'] == 'project_folder_moderator'
          moderated_folders << role['project_folder_id']
        end
      end
    end

    scope.where(id: moderated_folders)
  end
end
