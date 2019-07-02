class WebApi::V1::Notifications::StatusChangeOfYourIdeaSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :idea_title do |object|
    object.idea&.title_multiloc
  end

  belongs_to :idea, serializer: WebApi::V1::IdeaSerializer
  belongs_to :idea_status, serializer: WebApi::V1::IdeaStatusSerializer  
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer
end
