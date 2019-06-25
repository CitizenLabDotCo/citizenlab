class WebApi::V1::Fast::Notifications::CommentMarkedAsSpamSerializer < WebApi::V1::Fast::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
  belongs_to :spam_report, serializer: WebApi::V1::Fast::SpamReportSerializer
  belongs_to :idea, serializer: WebApi::V1::Fast::IdeaSerializer
  belongs_to :comment, serializer: WebApi::V1::Fast::CommentSerializer
  belongs_to :project, serializer: WebApi::V1::Fast::ProjectSerializer
end
