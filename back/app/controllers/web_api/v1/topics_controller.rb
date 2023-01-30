# frozen_string_literal: true

class WebApi::V1::TopicsController < ApplicationController
  before_action :set_topic, except: %i[index create]
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

    include_static_pages = params[:include]&.split(',')&.include?('static_pages')

    if include_static_pages
      render json: linked_json(
        @topics.includes(:static_pages),
        WebApi::V1::TopicSerializer,
        include: [:static_pages],
        params: fastjson_params(include_static_pages: true)
      )
      return
    end

    render json: linked_json(@topics, WebApi::V1::TopicSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::TopicSerializer.new(@topic, params: fastjson_params).serialized_json
  end

  def create
    @topic = Topic.new permitted_attributes(Topic)
    authorize @topic

    SideFxTopicService.new.before_create(@topic, current_user)
    if @topic.save
      SideFxTopicService.new.after_create(@topic, current_user)
      render json: ::WebApi::V1::TopicSerializer.new(
        @topic,
        params: fastjson_params
      ).serialized_json, status: :created
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @topic.assign_attributes permitted_attributes(@topic)
    authorize @topic
    SideFxTopicService.new.before_update(@topic, current_user)
    if @topic.save
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: ::WebApi::V1::TopicSerializer.new(
        @topic,
        params: fastjson_params
      ).serialized_json, status: :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxTopicService.new.before_update(@topic, current_user)
    ordering = permitted_attributes(@topic)[:ordering]
    if ordering && @topic.insert_at(ordering)
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: ::WebApi::V1::TopicSerializer.new(@topic.reload, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxTopicService.new.before_destroy(@topic, current_user)
    if @topic.destroy
      SideFxTopicService.new.after_destroy(@topic, current_user)
      head :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_topic
    @topic = Topic.find(params[:id])
    authorize @topic
  end
end
