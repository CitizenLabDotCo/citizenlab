# frozen_string_literal: true

module PublicApi
  class V2::CommentsController < PublicApiController
    before_action :set_comment, only: [:show]

    def index
      list_comments nil
    end

    def show
      render json: @comment,
        serializer: V2::CommentSerializer,
        adapter: :json
    end

    def for_ideas
      list_comments 'Idea'
    end

    private

    def list_comments(post_type)
      @comments = Comment.all
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)
      @comments = @comments.where(post_type: post_type) if post_type
      @comments = common_date_filters @comments

      render json: @comments,
        each_serializer: V2::CommentSerializer,
        adapter: :json,
        meta: meta_properties(@comments)
    end

    def set_comment
      @comment = Comment.find(params[:id])
    end
  end
end
