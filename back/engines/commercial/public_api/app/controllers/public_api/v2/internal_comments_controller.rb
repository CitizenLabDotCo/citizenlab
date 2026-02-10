# frozen_string_literal: true

module PublicApi
  class V2::InternalCommentsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items(
        InternalComment.where(finder_params),
        V2::InternalCommentSerializer,
        includes: [:idea]
      )
    end

    def show
      show_item InternalComment.find(params[:id]), V2::InternalCommentSerializer
    end

    def create
      internal_comment = InternalComment.new(create_params)

      side_fx.before_create(internal_comment, nil)
      if internal_comment.save
        side_fx.after_create(internal_comment, nil)
        show_item internal_comment, V2::InternalCommentSerializer, status: :created
      else
        render json: { errors: internal_comment.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def create_params
      params.require(:internal_comment).permit(:body, :idea_id, :parent_id)
    end

    def side_fx
      @side_fx ||= SideFxInternalCommentService.new
    end

    def finder_params
      params.permit(:idea_id)
    end
  end
end
