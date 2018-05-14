class WebApi::V1::External::Notifications::ProjectModerationRightsReceivedSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  belongs_to :initiating_user, serializer: CustomUserSerializer
  belongs_to :project, serializer: CustomProjectSerializer
  has_many :project_images, serializer: CustomImageSerializer

end