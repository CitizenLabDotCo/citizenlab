module EmailCampaigns::Campaigns
  class CommentDeletedByAdminSerializer < NotificationSerializer
    attributes :reason_code, :other_reason, :post_type

    belongs_to :initiating_user, serializer: CustomUserSerializer
    belongs_to :comment, serializer: CustomCommentSerializer
    belongs_to :comment_author, serializer: CustomUserSerializer
    belongs_to :initiative, serializer: CustomInitiativeSerializer
    belongs_to :initiative_author, serializer: CustomUserSerializer
    has_many :initiative_images, serializer: CustomImageSerializer
    has_many :initiative_topics, serializer: ::WebApi::V1::External::TopicSerializer
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, serializer: CustomUserSerializer
    has_many :idea_images, serializer: CustomImageSerializer
    has_many :idea_topics, serializer: ::WebApi::V1::External::TopicSerializer
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer


    def post_type
      object.comment.post_type
    end
  end
end