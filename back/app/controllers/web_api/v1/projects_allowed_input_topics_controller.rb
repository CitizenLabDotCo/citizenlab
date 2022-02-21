class WebApi::V1::ProjectsAllowedInputTopicsController < ApplicationController
  before_action :set_projects_allowed_input_topic, only: %i[show reorder destroy]
  skip_before_action :authenticate_user

  def show
    render json: WebApi::V1::ProjectsAllowedInputTopicSerializer.new(@projects_allowed_input_topic, params: fastjson_params).serialized_json
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
      render json: WebApi::V1::ProjectsAllowedInputTopicSerializer.new(@projects_allowed_input_topic.reload, params: fastjson_params).serialized_json, status: :ok
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
      head 500
    end
  end

  private

  def set_projects_allowed_input_topic
    @projects_allowed_input_topic = ProjectsAllowedInputTopic.find(params[:id])
    authorize @projects_allowed_input_topic
  end
end
