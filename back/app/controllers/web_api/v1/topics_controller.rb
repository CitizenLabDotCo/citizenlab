class WebApi::V1::TopicsController < ApplicationController
  before_action :set_topic, except: %i[index]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    @topics = policy_scope(Topic).includes(:projects_allowed_input_topics)
    @topics = @topics.where(code: params[:code]) if params[:code].present?
    @topics = @topics.where.not(code: params[:exclude_code]) if params[:exclude_code].present?

    if params[:sort].present?
      @topics = case params[:sort]
      when 'custom'
        if params[:project_id].present?
          @topics.where(projects_allowed_input_topics: { project_id: params[:project_id] })
                 .order('projects_allowed_input_topics.ordering')
        else
          @topics.order(:ordering)
        end
      when 'new'
        @topics.order_new
      when '-new'
        @topics.order_new(:asc)
      else
        raise 'Unsupported sort method'
      end
    end

    @topics = if params[:project_id].present?
      @topics.where(projects_allowed_input_topics: { project_id: params[:project_id] })
             .order('projects_allowed_input_topics.ordering')
    else
      @topics.order(:ordering)
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
