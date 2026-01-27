# frozen_string_literal: true

module PublicApi
  class V2::IdeasInputTopicsController < PublicApiController
    def index
      # We can't use the `list_items` method here because `IdeasInputTopic` doesn't have a
      # `created_at` column, which the `list_items` method relies on to order the
      # records (and at this point, we don't want to make the `list_items` method more
      # complex to handle this case).
      ideas_input_topics = IdeasInputTopic
        .where(query_filters)
        .order(:id)
        .page(params[:page_number])
        .per(num_per_page)

      render json: ideas_input_topics,
        each_serializer: V2::IdeasInputTopicSerializer,
        adapter: :json,
        meta: meta_properties(ideas_input_topics)
    end

    private

    def query_filters
      params.permit(:idea_id, :input_topic_id).to_h
    end
  end
end
