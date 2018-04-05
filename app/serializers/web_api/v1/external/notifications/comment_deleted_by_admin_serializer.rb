class WebApi::V1::External::Notifications::CommentDeletedByAdminSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  attributes :reason_code, :other_reason

  belongs_to :initiating_user, serializer: CustomUserSerializer
  belongs_to :comment, serializer: CustomCommentSerializer
  belongs_to :comment_author, serializer: CustomUserSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  belongs_to :idea_author, serializer: CustomUserSerializer
  has_many :idea_images, serializer: CustomImageSerializer
  has_many :idea_topics, serializer: WebApi::V1::TopicSerializer
  belongs_to :project, serializer: CustomProjectSerializer
  has_many :project_images, serializer: CustomImageSerializer

end