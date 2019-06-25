class WebApi::V1::Fast::Notifications::StatusChangeOfYourIdeaSerializer < WebApi::V1::Fast::Notifications::NotificationSerializer
  attribute :idea_title do |object|
    object.idea&.title_multiloc
  end

  belongs_to :idea, serializer: WebApi::V1::Fast::IdeaSerializer
  belongs_to :idea_status, serializer: WebApi::V1::Fast::IdeaStatusSerializer  
  belongs_to :project, serializer: WebApi::V1::Fast::ProjectSerializer
end
