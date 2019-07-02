class WebApi::V1::Notifications::CommentDeletedByAdminSerializer < WebApi::V1::Notifications::NotificationSerializer
  attributes :reason_code, :other_reason

  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  attribute :idea_title do |object|
    object.idea&.title_multiloc
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :idea, record_type: :idea, serializer: WebApi::V1::IdeaSerializer
  belongs_to :comment, record_type: :comment, serializer: WebApi::V1::CommentSerializer
  belongs_to :project, record_type: :project, serializer: WebApi::V1::ProjectSerializer
end
