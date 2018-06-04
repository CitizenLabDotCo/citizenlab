class WebApi::V1::External::Notifications::AdminRightsReceivedSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  belongs_to :initiating_user, serializer: CustomUserSerializer

end