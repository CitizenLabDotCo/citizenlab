class WebApi::V1::Notifications::ProjectModerationRightsReceivedSerializer < WebApi::V1::Notifications::NotificationSerializer
  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer
end
