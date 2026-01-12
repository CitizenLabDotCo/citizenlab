# frozen_string_literal: true

class WebApi::V1::InputTopicsController < ApplicationController
  before_action :set_input_topic, except: %i[index create]
  before_action :set_project
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    input_topics = policy_scope(InputTopic, policy_scope_class: InputTopicPolicy::Scope)
      .where(project: @project)

    # Get filtered ideas for ideas_count sorting
    filter_ideas = policy_scope(Idea).where(project: @project)

    input_topics =
      case params[:sort]
      when 'custom', nil
        input_topics.order(:ordering)
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
      params: jsonapi_serializer_params
    )
  end

  def show
    render json: WebApi::V1::InputTopicSerializer.new(
      @input_topic,
      params: jsonapi_serializer_params
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
        params: jsonapi_serializer_params
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
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxInputTopicService.new.before_update(@input_topic, current_user)
    ordering = permitted_attributes(@input_topic)[:ordering]
    if ordering && @input_topic.insert_at(ordering)
      SideFxInputTopicService.new.after_update(@input_topic, current_user)
      render json: WebApi::V1::InputTopicSerializer.new(
        @input_topic.reload,
        params: jsonapi_serializer_params
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
