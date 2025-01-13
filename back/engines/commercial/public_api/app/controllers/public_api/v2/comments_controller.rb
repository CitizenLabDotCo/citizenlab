# frozen_string_literal: true

module PublicApi
  class V2::CommentsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items(Comment.all, V2::CommentSerializer, includes: [:idea])
    end

    def show
      show_item Comment.find(params[:id]), V2::CommentSerializer
    end
  end
end
