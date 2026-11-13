class FoldersFinderAdminService
  def self.execute(scope, params, current_user: nil)
    folders = filter_status(scope, params)
    folders = filter_folder_manager(folders, params)
    folders = search(folders, params)
    folders = filter_space(folders, params)
    folders = filter_top_level(folders, params, current_user)

    if params[:sort] == 'arranged'
      # The order admins arranged folders in for the front office
      folders
        .joins(:admin_publication)
        .order('admin_publications.ordering ASC, project_folders_folders.id ASC')
    else
      folders
        .order('project_folders_folders.created_at DESC, project_folders_folders.id ASC')
    end
  end

  # FILTERING METHODS
  def self.filter_status(scope, params = {})
    statuses = params[:status] || []
    return scope if statuses.blank?

    scope.where(admin_publication: AdminPublication.with_status(statuses))
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

  def self.search(scope, params = {})
    search = params[:search] || ''
    return scope if search.blank?

    scope.search_by_title(search)
  end

  def self.filter_space(scope, params = {})
    space_ids = params[:space_ids]
    return scope if space_ids.blank?

    scope.where(space_id: space_ids)
  end

  # Keeps the folders that sit directly at the level of the admin project
  # hierarchy being viewed: not inside a space the user can open, unless that
  # space is the level being viewed (`space_ids`).
  def self.filter_top_level(scope, params, current_user)
    return scope unless params[:top_level].to_s == 'true'
    return scope.none unless current_user

    space_ids = AdminHierarchyScope.spaces(current_user).where.not(id: Array(params[:space_ids])).select(:id)
    scope.where(space_id: nil).or(scope.where.not(space_id: space_ids))
  end
end
