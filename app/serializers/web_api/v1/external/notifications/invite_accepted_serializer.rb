class WebApi::V1::External::Notifications::InviteAcceptedSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  belongs_to :initiating_user, serializer: CustomUserSerializer
  belongs_to :invite, serializer: WebApi::V1::InviteSerializer
end