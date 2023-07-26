# frozen_string_literal: true

module PublicApi
  class V2::CommentsController < PublicApiController
    include DeletedItemsAction

    POST_TYPES = [Idea, Initiative].map do |klass|
      V2::BaseSerializer.classname_to_type(klass.name)
    end.freeze

    def index
      comments = post_type ? Comment.where(post_type: post_type) : Comment.all
      list_items(comments, V2::CommentSerializer)
    end

    def show
      show_item Comment.find(params[:id]), V2::CommentSerializer
    end

    private

    def post_type
      @post_type ||= if (post_type = params[:post_type])
        validate_post_type!(post_type)
        V2::BaseSerializer.type_to_classname(post_type)
      end
    end

    def validate_post_type!(post_type)
      return if POST_TYPES.include?(post_type)

      raise InvalidEnumParameterValueError.new(
        :post_type,
        post_type,
        POST_TYPES
      )
    end
  end
end
