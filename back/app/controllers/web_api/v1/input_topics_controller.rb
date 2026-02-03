# frozen_string_literal: true

class WebApi::V1::InputTopicsController < ApplicationController
  before_action :set_input_topic, except: %i[index create]
  before_action :set_project
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    input_topics = policy_scope(InputTopic, policy_scope_class: InputTopicPolicy::Scope)
      .where(project: @project)

    input_topics = input_topics.where(parent_id: params[:parent_id]) if params.key?(:parent_id)
    input_topics = input_topics.where(depth: params[:depth]) if params.key?(:depth)

    # Get filtered ideas for ideas_count sorting
    filter_ideas = policy_scope(Idea).where(project: @project)

    input_topics =
      case params[:sort]
      when 'custom', nil
        # Return tree structure - roots first, ordered by lft
        input_topics.order(:lft)
      when 'ideas_count'
        input_topics.order_ideas_count(filter_ideas)
      when '-ideas_count'
        input_topics.order_ideas_count(filter_ideas, direction: :desc)
      else
        raise 'Unsupported sort method'
      end

    input_topics = paginate input_topics

    render json: linked_json(
      input_topics,
      WebApi::V1::InputTopicSerializer,
      params: jsonapi_serializer_params,
      include: [:children, :parent]
    )
  end

  def show
    render json: WebApi::V1::InputTopicSerializer.new(
      @input_topic,
      params: jsonapi_serializer_params,
      include: [:children]
    ).serializable_hash
  end

  def create
    @input_topic = InputTopic.new
    @input_topic.project = @project
    authorize @input_topic
    @input_topic.assign_attributes permitted_attributes(InputTopic)

    SideFxInputTopicService.new.before_create(@input_topic, current_user)
    if @input_topic.save
      SideFxInputTopicService.new.after_create(@input_topic, current_user)
      render json: WebApi::V1::InputTopicSerializer.new(
        @input_topic,
        params: jsonapi_serializer_params,
        include: [:children]
      ).serializable_hash, status: :created
    else
      render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @input_topic.assign_attributes permitted_attributes(@input_topic)
    authorize @input_topic

    SideFxInputTopicService.new.before_update(@input_topic, current_user)
    if @input_topic.save
      SideFxInputTopicService.new.after_update(@input_topic, current_user)
      render json: WebApi::V1::InputTopicSerializer.new(
        @input_topic,
        params: jsonapi_serializer_params,
        include: [:children]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  # Move topic within the tree
  # position: 'child' (make child of target), 'left' (move before target), 'right' (move after target), 'root' (make root)
  def move
    SideFxInputTopicService.new.before_update(@input_topic, current_user)

    move_params = permitted_attributes(@input_topic)
    position = move_params[:position]
    target_id = move_params[:target_id]

    success = case position
    when 'child'
      target = InputTopic.find(target_id)
      @input_topic.move_to_child_of(target)
    when 'left'
      target = InputTopic.find(target_id)
      @input_topic.move_to_left_of(target)
    when 'right'
      target = InputTopic.find(target_id)
      @input_topic.move_to_right_of(target)
    when 'root'
      @input_topic.move_to_root
    else
      false
    end

    if success
      SideFxInputTopicService.new.after_update(@input_topic, current_user)
      render json: WebApi::V1::InputTopicSerializer.new(
        @input_topic.reload,
        params: jsonapi_serializer_params,
        include: [:children]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxInputTopicService.new.before_destroy(@input_topic, current_user)
    if @input_topic.destroy
      SideFxInputTopicService.new.after_destroy(@input_topic, current_user)
      head :ok
    else
      render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_project
    @project = if params[:project_id]
      Project.find(params[:project_id])
    else
      @input_topic&.project
    end
  end

  def set_input_topic
    @input_topic = InputTopic.find(params[:id])
    authorize @input_topic
  end
end
