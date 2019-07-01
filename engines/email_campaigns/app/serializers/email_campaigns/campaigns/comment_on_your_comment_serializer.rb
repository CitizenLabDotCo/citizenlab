module EmailCampaigns::Campaigns
  class CommentOnYourCommentSerializer < NotificationSerializer
    belongs_to :initiating_user, record_type: :user, serializer: CustomUserSerializer
    belongs_to :comment, serializer: CustomCommentSerializer
    belongs_to :comment_author, record_type: :user, serializer: CustomUserSerializer do |object|
      object.comment&.author
    end
    belongs_to :idea, serializer: CustomIdeaSerializer
    belongs_to :idea_author, record_type: :user, serializer: CustomUserSerializer do |object|
      object.idea&.author
    end
    has_many :idea_images, serializer: CustomImageSerializer do |object|
      object.idea.&idea_images
    end
    belongs_to :project, serializer: CustomProjectSerializer
    has_many :project_images, serializer: CustomImageSerializer do |object|
      object.project.&project_images
    end

    belongs_to :parent_comment, record_type: :comment, serializer: CustomCommentSerializer do |object|
      object.comment&.parent
    end
    belongs_to :parent_comment_author, record_type: :user, serializer: CustomUserSerializer do |object|
      object.comment&.parent&.author
    end

  end
end