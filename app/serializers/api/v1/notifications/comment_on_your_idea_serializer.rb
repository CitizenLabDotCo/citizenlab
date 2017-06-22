class Api::V1::Notifications::CommentOnYourIdeaSerializer < Api::V1::Notifications::NotificationSerializer

  belongs_to :user, serializer: Api::V1::LiteUserSerializer
  belongs_to :idea, serializer: Api::V1::LiteIdeaSerializer
  belongs_to :comment, serializer: Api::V1::LiteCommentSerializer  
  belongs_to :project, serializer: Api::V1::LiteProjectSerializer

  attributes :user_first_name, :user_last_name, :user_slug, :idea_title

  def user_first_name
    object.user&.first_name
  end

  def user_last_name
    object.user&.last_name
  end

  def user_slug
    object.user&.slug
  end

  def idea_title
    object.idea&.title_multiloc
  end

end
