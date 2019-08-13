class WebApi::V1::Notifications::CommentOnYourCommentSerializer < WebApi::V1::Notifications::NotificationSerializer
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

  attribute :idea_slug do |object|
    object.idea&.slug
  end

  attribute :initiative_title do |object|
    object.initiative&.title_multiloc
  end

  attribute :initiative_slug do |object|
    object.initiative&.slug
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer
  belongs_to :idea, serializer: WebApi::V1::IdeaSerializer
  belongs_to :initiative, serializer: WebApi::V1::InitiativeSerializer
  belongs_to :comment, serializer: WebApi::V1::CommentSerializer
end
