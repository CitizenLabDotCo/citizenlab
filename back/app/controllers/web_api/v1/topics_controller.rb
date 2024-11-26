# frozen_string_literal: true

class WebApi::V1::TopicsController < ApplicationController
  before_action :set_topic, except: %i[index create]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    topics = policy_scope(Topic)
    topics = TopicsFilteringService.new.filter(topics, params: params, current_user: current_user)
    filter_ideas = Idea
    if params.key? :ideas
      filter_ideas = IdeasFinder.new(
        params.delete(:ideas),
        scope: policy_scope(Idea),
        current_user: current_user
      ).find_records
      topics = Topic.where(id: topics.includes(:ideas_topics).where(ideas_topics: { idea_id: filter_ideas }))
    end

    topics =
      case params[:sort]
      when 'custom', nil
        topics.order(:ordering)
      when 'new'
        topics.order_new
      when '-new'
        topics.order_new(:asc)
      when 'projects_count'
        topics.order_projects_count
      when '-projects_count'
        topics.order_projects_count(:asc)
      when 'ideas_count'
        topics.order_ideas_count(filter_ideas)
      when '-ideas_count'
        topics.order_ideas_count(filter_ideas, direction: :desc)
      else
        raise 'Unsupported sort method'
      end

    topics = paginate topics

    topics = topics.includes(:static_pages)

    include_static_pages = params[:include]&.split(',')&.include?('static_pages')
    user_followers = current_user&.follows
      &.where(followable_type: 'Topic')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    if include_static_pages
      render json: linked_json(
        topics,
        WebApi::V1::TopicSerializer,
        include: [:static_pages],
        params: jsonapi_serializer_params(include_static_pages: true, user_followers: user_followers)
      )
      return
    end

    render json: linked_json(topics, WebApi::V1::TopicSerializer, params: jsonapi_serializer_params(user_followers: user_followers))
  end

  def show
    render json: WebApi::V1::TopicSerializer.new(@topic, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @topic = Topic.new permitted_attributes(Topic)
    authorize @topic

    SideFxTopicService.new.before_create(@topic, current_user)
    if @topic.save
      SideFxTopicService.new.after_create(@topic, current_user)
      render json: ::WebApi::V1::TopicSerializer.new(
        @topic,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
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
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxTopicService.new.before_update(@topic, current_user)
    ordering = permitted_attributes(@topic)[:ordering]
    if ordering && @topic.insert_at(ordering)
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: ::WebApi::V1::TopicSerializer.new(@topic.reload, params: jsonapi_serializer_params).serializable_hash, status: :ok
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

WebApi::V1::TopicsController.include(AggressiveCaching::Patches::WebApi::V1::TopicsController)
