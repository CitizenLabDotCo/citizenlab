module EmailCampaigns::Campaigns
  class MentionInOfficialFeedbackSerializer < NotificationSerializer
    belongs_to :initiating_user, serializer: CustomUserSerializer
    belongs_to :official_feedback, serializer: CustomOfficialFeedbackSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, serializer: CustomUserSerializer
    has_many :idea_images, serializer: CustomImageSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer

  end
end