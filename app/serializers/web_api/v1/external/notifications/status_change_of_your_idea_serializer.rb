class WebApi::V1::External::Notifications::StatusChangeOfYourIdeaSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  belongs_to :idea_status, serializer: WebApi::V1::IdeaStatusSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  belongs_to :idea_author, serializer: CustomUserSerializer
  has_many :idea_images, serializer: CustomImageSerializer
  has_many :idea_topics, serializer: WebApi::V1::TopicSerializer
  belongs_to :project, serializer: CustomProjectSerializer
  has_many :project_images, serializer: CustomImageSerializer

  def idea_status
    object.idea&.idea_status
  end

end