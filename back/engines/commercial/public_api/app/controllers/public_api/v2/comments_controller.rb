# frozen_string_literal: true

module PublicApi
  class V2::CommentsController < PublicApiController
    def index
      list_items Comment.all, V2::CommentSerializer
    end

    def for_ideas
      list_items Comment.where(post_type: 'Idea'), V2::IdeaCommentSerializer
    end

    def for_initiatives
      list_items Comment.where(post_type: 'Initiative'), V2::InitiativeCommentSerializer
    end

    def show
      show_item Comment.find(params[:id]), V2::CommentSerializer
    end
  end
end
