class WebApi::V1::FolderModeratorsController < WebApi::V1::ModeratorsController
  private

  def find_moderatable
    ProjectFolders::Folder.find(params[:project_folder_id])
  end

  def role_type
    'project_folder_moderator'
  end

  def role_id_params
    { project_folder_id: @moderatable.id }
  end

  def moderator_scope
    User.project_folder_moderator(@moderatable.id)
  end

  def moderator_policy_class
    FolderModeratorPolicy
  end
end
