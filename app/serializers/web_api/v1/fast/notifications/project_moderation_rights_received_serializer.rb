class WebApi::V1::Fast::Notifications::ProjectModerationRightsReceivedSerializer < WebApi::V1::Fast::Notifications::NotificationSerializer
  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
  belongs_to :project, serializer: WebApi::V1::Fast::ProjectSerializer
end
