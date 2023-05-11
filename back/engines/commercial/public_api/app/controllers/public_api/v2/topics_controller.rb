# frozen_string_literal: true

module PublicApi
  class V2::TopicsController < PublicApiController
    before_action :set_topic, only: [:show]

    def index
      @topics = Topic.all
        .order(created_at: :desc)
        .page(params[:page_number])
        .per([params[:page_size]&.to_i || 12, 24].min)

      render json: @topics,
        each_serializer: V2::TopicSerializer,
        adapter: :json,
        meta: meta_properties(@topics)
    end

    def show
      render json: @topic,
        serializer: V2::TopicSerializer,
        adapter: :json
    end

    private

    def set_topic
      @topic = Topic.find(params[:id])
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end
  end
end
