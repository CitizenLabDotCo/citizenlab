class WebApi::V1::Fast::Notifications::AdminRightsReceivedSerializer < WebApi::V1::Fast::Notifications::NotificationSerializer

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer

end
