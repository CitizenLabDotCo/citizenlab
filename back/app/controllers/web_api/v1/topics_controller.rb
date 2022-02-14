class WebApi::V1::TopicsController < ApplicationController
  before_action :set_topic, except: %i[index]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    @topics = policy_scope(Topic)
    @topics = TopicsFilteringService.new.filter(@topics, params: params, current_user: current_user)

    @topics =
      case params[:sort]
      when 'custom', nil
        @topics.order(:ordering)
      when 'new'
        @topics.order_new
      when '-new'
        @topics.order_new(:asc)
      else
        raise 'Unsupported sort method'
      end

    @topics = paginate @topics

    render json: linked_json(@topics, WebApi::V1::TopicSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::TopicSerializer.new(@topic, params: fastjson_params).serialized_json
  end

  private

  def set_topic
    @topic = Topic.find(params[:id])
    authorize @topic
  end
end
