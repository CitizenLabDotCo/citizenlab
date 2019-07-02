class WebApi::V1::Notifications::AdminRightsReceivedSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer

end
