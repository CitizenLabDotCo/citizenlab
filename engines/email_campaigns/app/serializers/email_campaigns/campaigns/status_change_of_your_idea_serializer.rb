module EmailCampaigns::Campaigns
  class StatusChangeOfYourIdeaSerializer < NotificationSerializer
    belongs_to :idea_status, serializer: ::WebApi::V1::External::IdeaStatusSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, serializer: CustomUserSerializer
    has_many :idea_images, serializer: CustomImageSerializer
    has_many :idea_topics, serializer: ::WebApi::V1::External::TopicSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer

    def idea_status
      object.idea&.idea_status
    end
  end
end