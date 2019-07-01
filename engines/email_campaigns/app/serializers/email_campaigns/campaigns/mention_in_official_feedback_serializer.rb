module EmailCampaigns::Campaigns
  class MentionInOfficialFeedbackSerializer < NotificationSerializer
    belongs_to :initiating_user, record_type: :user, serializer: CustomUserSerializer
    belongs_to :official_feedback, serializer: CustomOfficialFeedbackSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, record_type: :user, serializer: CustomUserSerializer do |object|
      object.idea&.author
    end
    has_many :idea_images, serializer: CustomImageSerializer do |object|
      object.idea&.idea_images
    end
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer do |object|
      object.project&.project_images
    end

  end
end