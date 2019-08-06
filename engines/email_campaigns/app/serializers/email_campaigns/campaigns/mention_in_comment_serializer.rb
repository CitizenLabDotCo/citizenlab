module EmailCampaigns::Campaigns
  class MentionInCommentSerializer < NotificationSerializer
    attribute :post_type
    
    belongs_to :initiating_user, serializer: CustomUserSerializer
    belongs_to :comment, serializer: CustomCommentSerializer
    belongs_to :comment_author, serializer: CustomUserSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, serializer: CustomUserSerializer
    has_many :idea_images, serializer: CustomImageSerializer
    belongs_to :initiative, serializer: CustomInitiativeSerializer
    belongs_to :initiative_author, serializer: CustomUserSerializer
    has_many :initiative_images, serializer: CustomImageSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer

    belongs_to :parent_comment, serializer: CustomCommentSerializer
    belongs_to :parent_comment_author, serializer: CustomUserSerializer


    def post_type
      object.comment.post_type
    end

    def parent_comment
      object.comment&.parent
    end

    def parent_comment_author
      object.comment&.parent&.author
    end
  end
end