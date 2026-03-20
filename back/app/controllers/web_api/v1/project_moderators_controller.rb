class WebApi::V1::ProjectModeratorsController < WebApi::V1::ModeratorsController
  private

  def find_moderatable
    Project.find(params[:project_id])
  end

  def role_type
    'project_moderator'
  end

  def role_id_params
    { project_id: @moderatable.id }
  end

  def moderator_scope
    User.project_moderator(@moderatable.id)
  end

  def moderator_policy_class
    ProjectModeratorPolicy
  end
end
