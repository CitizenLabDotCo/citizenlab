module EmailCampaigns::Campaigns
  class MentionInOfficialFeedbackSerializer < NotificationSerializer
    attribute :post_type

    belongs_to :initiating_user, serializer: CustomUserSerializer
    belongs_to :official_feedback, serializer: CustomOfficialFeedbackSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, serializer: CustomUserSerializer
    has_many :idea_images, serializer: CustomImageSerializer
    belongs_to :initiative, serializer: CustomInitiativeSerializer
    belongs_to :initiative_author, serializer: CustomUserSerializer
    has_many :initiative_images, serializer: CustomImageSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer

    def post_type
      object.comment.post_type
    end

  end
end