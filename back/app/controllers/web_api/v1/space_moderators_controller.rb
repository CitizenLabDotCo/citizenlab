class WebApi::V1::SpaceModeratorsController < WebApi::V1::ModeratorsController
  private

  def find_moderatable
    Space.find(params[:space_id])
  end

  def role_type
    'space_moderator'
  end

  def role_id_params
    { space_id: @moderatable.id }
  end

  def moderator_scope
    User.space_moderator(@moderatable.id)
  end

  def moderator_policy_class
    SpaceModeratorPolicy
  end
end
