# frozen_string_literal: true

module PublicApi
  class V2::IdeaTopicsController < PublicApiController
    def index
      # We can't use the `list_items` method here because `IdeasTopic` doesn't have a
      # `created_at` column, which the `list_items` method relies on to order the
      # records (and at this point, we don't want to make the `list_items` method more
      # complex to handle this case).
      idea_topics = IdeasInputTopic
        .where(query_filters)
        .order(:id)
        .page(params[:page_number])
        .per(num_per_page)

      render json: idea_topics,
        each_serializer: V2::IdeaTopicSerializer,
        adapter: :json,
        meta: meta_properties(idea_topics)
    end

    private

    def query_filters
      result = params.permit(:idea_id, :topic_id).to_h
      result[:input_topic_id] = result.delete(:topic_id) if result.key?(:topic_id)
      result
    end
  end
end
