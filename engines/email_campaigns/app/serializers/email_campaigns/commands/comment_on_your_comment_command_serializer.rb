module EmailCampaigns::Commands
  class CommentOnYourCommentCommandSerializer < CommandSerializer

    belongs_to :initiating_user, serializer: CommandUserSerializer
    belongs_to :comment, serializer: CommandCommentSerializer
    belongs_to :comment_author, serializer: CommandUserSerializer
    belongs_to :idea, serializer: CommandIdeaSerializer
    belongs_to :idea_author, serializer: CommandUserSerializer
    has_many :idea_images, serializer: CommandImageSerializer
    belongs_to :project, serializer: CommandProjectSerializer
    has_many :project_images, serializer: CommandImageSerializer

    belongs_to :parent_comment, serializer: CommandCommentSerializer
    belongs_to :parent_comment_author, serializer: CommandUserSerializer


    def parent_comment
    	object.comment&.parent
    end

    def parent_comment_author
    	object.comment&.parent&.author
    end

  end
end