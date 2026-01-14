# frozen_string_literal: true

class WebApi::V1::ProjectsAllowedInputTopicsController < ApplicationController
  before_action :set_projects_allowed_input_topic, only: %i[show reorder destroy]
  skip_before_action :authenticate_user

  def index
    @projects_allowed_input_topics = policy_scope(ProjectsAllowedInputTopic)
    @projects_allowed_input_topics = @projects_allowed_input_topics.where(project_id: params[:project_id])

    @projects_allowed_input_topics = paginate @projects_allowed_input_topics.order(:ordering)

    render json: linked_json(@projects_allowed_input_topics, WebApi::V1::ProjectsAllowedInputTopicSerializer, params: jsonapi_serializer_params, include: [:topic])
  end

  def show
    render json: WebApi::V1::ProjectsAllowedInputTopicSerializer.new(@projects_allowed_input_topic, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @projects_allowed_input_topic = ProjectsAllowedInputTopic.new(permitted_attributes(ProjectsAllowedInputTopic))
    authorize @projects_allowed_input_topic

    SideFxProjectsAllowedInputTopicService.new.before_create @projects_allowed_input_topic, current_user
    if @projects_allowed_input_topic.save
      SideFxProjectsAllowedInputTopicService.new.after_create @projects_allowed_input_topic, current_user
      head :created
    else
      render json: { errors: @projects_allowed_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxProjectsAllowedInputTopicService.new.before_update(@projects_allowed_input_topic, current_user)
    ordering = permitted_attributes(@projects_allowed_input_topic)[:ordering]
    if ordering && @projects_allowed_input_topic.insert_at(ordering)
      SideFxProjectsAllowedInputTopicService.new.after_update(@projects_allowed_input_topic, current_user)
      render json: WebApi::V1::ProjectsAllowedInputTopicSerializer.new(@projects_allowed_input_topic.reload, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @projects_allowed_input_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxProjectsAllowedInputTopicService.new.before_destroy @projects_allowed_input_topic, current_user
    projects_allowed_input_topic = @projects_allowed_input_topic.destroy
    if projects_allowed_input_topic.destroyed?
      SideFxProjectsAllowedInputTopicService.new.after_destroy projects_allowed_input_topic, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_projects_allowed_input_topic
    @projects_allowed_input_topic = ProjectsAllowedInputTopic.find(params[:id])
    authorize @projects_allowed_input_topic
  end
end
