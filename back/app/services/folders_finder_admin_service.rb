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
end
