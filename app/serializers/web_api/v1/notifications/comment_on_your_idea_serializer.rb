class WebApi::V1::Notifications::CommentOnYourIdeaSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :user, serializer: WebApi::V1::UserSerializer
  belongs_to :idea, serializer: WebApi::V1::IdeaSerializer
  belongs_to :comment, serializer: WebApi::V1::CommentSerializer  
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer

  attributes :user_first_name, :user_last_name, :user_slug, :idea_title

  def user
    object.recipient
  end

  def user_first_name
    object.recipient&.first_name
  end

  def user_last_name
    object.recipient&.last_name
  end

  def user_slug
    object.recipient&.slug
  end

  def idea_title
    object.idea&.title_multiloc
  end

end
