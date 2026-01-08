# frozen_string_literal: true

class WebApi::V1::DefaultInputTopicsController < ApplicationController
  before_action :set_default_input_topic, except: %i[index create]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    default_input_topics = policy_scope(DefaultInputTopic).order(:ordering)
    default_input_topics = paginate default_input_topics

    render json: linked_json(
      default_input_topics,
      WebApi::V1::DefaultInputTopicSerializer,
      params: jsonapi_serializer_params
    )
  end

  def show
    render json: WebApi::V1::DefaultInputTopicSerializer.new(
      @default_input_topic,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    @default_input_topic = DefaultInputTopic.new
    authorize @default_input_topic
    @default_input_topic.assign_attributes permitted_attributes(DefaultInputTopic)

    SideFxDefaultInputTopicService.new.before_create(@default_input_topic, current_user)
    if @default_input_topic.save
      SideFxDefaultInputTopicService.new.after_create(@default_input_topic, current_user)
      render json: WebApi::V1::DefaultInputTopicSerializer.new(
        @default_input_topic,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @default_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @default_input_topic.assign_attributes permitted_attributes(@default_input_topic)
    authorize @default_input_topic

    SideFxDefaultInputTopicService.new.before_update(@default_input_topic, current_user)
    if @default_input_topic.save
      SideFxDefaultInputTopicService.new.after_update(@default_input_topic, current_user)
      render json: WebApi::V1::DefaultInputTopicSerializer.new(
        @default_input_topic,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @default_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxDefaultInputTopicService.new.before_update(@default_input_topic, current_user)
    ordering = permitted_attributes(@default_input_topic)[:ordering]
    if ordering && @default_input_topic.insert_at(ordering)
      SideFxDefaultInputTopicService.new.after_update(@default_input_topic, current_user)
      render json: WebApi::V1::DefaultInputTopicSerializer.new(
        @default_input_topic.reload,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @default_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxDefaultInputTopicService.new.before_destroy(@default_input_topic, current_user)
    if @default_input_topic.destroy
      SideFxDefaultInputTopicService.new.after_destroy(@default_input_topic, current_user)
      head :ok
    else
      render json: { errors: @default_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_default_input_topic
    @default_input_topic = DefaultInputTopic.find(params[:id])
    authorize @default_input_topic
  end
end
