# frozen_string_literal: true

class WebApi::V1::GlobalTopicsController < ApplicationController
  before_action :set_global_topic, except: %i[index create]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    global_topics = policy_scope(GlobalTopic)
    global_topics = TopicsFilteringService.new.filter(global_topics, params: params, current_user: current_user)

    global_topics =
      case params[:sort]
      when 'custom', nil
        global_topics.order(:ordering)
      when 'new'
        global_topics.order_new
      when '-new'
        global_topics.order_new(:asc)
      when 'projects_count'
        global_topics.order_projects_count
      when '-projects_count'
        global_topics.order_projects_count(:asc)
      else
        raise 'Unsupported sort method'
      end

    global_topics = paginate global_topics

    global_topics = global_topics.includes(:static_pages)

    include_static_pages = params[:include]&.split(',')&.include?('static_pages')
    user_followers = current_user&.follows
      &.where(followable_type: 'GlobalTopic')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    if include_static_pages
      render json: linked_json(
        global_topics,
        WebApi::V1::GlobalTopicSerializer,
        include: [:static_pages],
        params: jsonapi_serializer_params(include_static_pages: true, user_followers: user_followers)
      )
      return
    end

    render json: linked_json(global_topics, WebApi::V1::GlobalTopicSerializer, params: jsonapi_serializer_params(user_followers: user_followers))
  end

  def show
    render json: WebApi::V1::GlobalTopicSerializer.new(@global_topic, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @global_topic = GlobalTopic.new permitted_attributes(GlobalTopic)
    authorize @global_topic

    SideFxGlobalTopicService.new.before_create(@global_topic, current_user)
    if @global_topic.save
      SideFxGlobalTopicService.new.after_create(@global_topic, current_user)
      render json: ::WebApi::V1::GlobalTopicSerializer.new(
        @global_topic,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @global_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @global_topic.assign_attributes permitted_attributes(@global_topic)
    authorize @global_topic
    SideFxGlobalTopicService.new.before_update(@global_topic, current_user)
    if @global_topic.save
      SideFxGlobalTopicService.new.after_update(@global_topic, current_user)
      render json: ::WebApi::V1::GlobalTopicSerializer.new(
        @global_topic,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @global_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxGlobalTopicService.new.before_update(@global_topic, current_user)
    ordering = permitted_attributes(@global_topic)[:ordering]
    if ordering && @global_topic.insert_at(ordering)
      SideFxGlobalTopicService.new.after_update(@global_topic, current_user)
      render json: ::WebApi::V1::GlobalTopicSerializer.new(@global_topic.reload, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @global_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxGlobalTopicService.new.before_destroy(@global_topic, current_user)
    if @global_topic.destroy
      SideFxGlobalTopicService.new.after_destroy(@global_topic, current_user)
      head :ok
    else
      render json: { errors: @global_topic.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_global_topic
    @global_topic = GlobalTopic.find(params[:id])
    authorize @global_topic
  end
end

WebApi::V1::GlobalTopicsController.include(AggressiveCaching::Patches::WebApi::V1::GlobalTopicsController)
