class WebApi::V1::ProjectsTopicsController < ApplicationController
  before_action :set_projects_topic, only: %i[show reorder destroy]
  skip_before_action :authenticate_user

  def index
    @projects_topics = policy_scope(ProjectsTopic)
    @projects_topics = @projects_topics.where(project_id: params[:project_id]) if params[:project_id].present?

    @projects_topics = paginate @projects_topics.order(:ordering)

    render json: linked_json(@projects_topics, WebApi::V1::ProjectsTopicSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::ProjectsTopicSerializer.new(@projects_topic, params: fastjson_params).serialized_json
  end

  def create
    @projects_topic = ProjectsTopic.new(permitted_attributes(ProjectsTopic))
    authorize @projects_topic

    SideFxProjectsTopicService.new.before_create @projects_topic, current_user
    if @projects_topic.save
      SideFxProjectsTopicService.new.after_create @projects_topic, current_user
      head :created
    else
      render json: { errors: @projects_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    SideFxProjectsTopicService.new.before_update(@projects_topic, current_user)
    ordering = permitted_attributes(@projects_topic)[:ordering]
    if ordering && @projects_topic.insert_at(ordering)
      SideFxProjectsTopicService.new.after_update(@projects_topic, current_user)
      render json: WebApi::V1::ProjectsTopicSerializer.new(@projects_topic.reload, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @projects_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxProjectsTopicService.new.before_destroy @projects_topic, current_user
    projects_topic = @projects_topic.destroy
    if projects_topic.destroyed?
      SideFxProjectsTopicService.new.after_destroy projects_topic, current_user
      head :ok
    else
      head 500
    end
  end

  private

  def set_projects_topic
    @projects_topic = ProjectsTopic.find(params[:id])
    authorize @projects_topic
  end
end
