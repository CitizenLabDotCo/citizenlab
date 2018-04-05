class WebApi::V1::Notifications::StatusChangeOfYourIdeaSerializer < WebApi::V1::Notifications::NotificationSerializer

  belongs_to :idea, serializer: WebApi::V1::IdeaSerializer
  belongs_to :idea_status, serializer: WebApi::V1::IdeaStatusSerializer  
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer

  attributes :idea_title


  def idea_status
    object.idea&.idea_status
  end

  def idea_title
    object.idea&.title_multiloc
  end

end
