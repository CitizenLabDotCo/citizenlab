class WebApi::V1::Notifications::InviteAcceptedSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :initiating_user, serializer: WebApi::V1::UserSerializer
  belongs_to :invite, serializer: WebApi::V1::InviteSerializer

  attributes :initiating_user_first_name, :initiating_user_last_name, :initiating_user_slug


  def initiating_user_first_name
    object.initiating_user&.first_name
  end

  def initiating_user_last_name
    object.initiating_user&.last_name
  end

  def initiating_user_slug
    object.initiating_user&.slug
  end

end
