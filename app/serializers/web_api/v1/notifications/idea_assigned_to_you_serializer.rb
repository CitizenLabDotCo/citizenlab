class WebApi::V1::Notifications::IdeaAssignedToYouSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :initiating_user, serializer: WebApi::V1::UserSerializer
  belongs_to :idea, serializer: WebApi::V1::IdeaSerializer 
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer

  attributes :idea_title_multiloc, :idea_slug
  

  def idea_title_multiloc
    object.idea&.title_multiloc
  end

  def idea_slug
    object.idea&.slug
  end

end
