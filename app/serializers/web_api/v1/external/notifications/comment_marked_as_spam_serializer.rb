class WebApi::V1::External::Notifications::CommentMarkedAsSpamSerializer < WebApi::V1::External::Notifications::NotificationSerializer
  belongs_to :initiating_user, serializer: CustomUserSerializer
  belongs_to :spam_report, serializer: WebApi::V1::External::SpamReportSerializer
  belongs_to :comment, serializer: CustomCommentSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  has_many :idea_images, serializer: CustomImageSerializer
  belongs_to :project, serializer: CustomProjectSerializer
  has_many :project_images, serializer: CustomImageSerializer
end