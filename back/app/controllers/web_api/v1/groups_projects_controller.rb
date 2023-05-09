# frozen_string_literal: true

class WebApi::V1::GroupsProjectsController < ApplicationController
  before_action :set_groups_project, only: %i[show destroy]

  def index
    @groups_projects = policy_scope(GroupsProject)
      .where(project_id: params[:project_id])
      .includes(:group)

    @groups_projects = case params[:sort]
    when 'new'
      @groups_projects.order_new
    when '-new'
      @groups_projects.order_new(:asc)
    when nil
      @groups_projects
    else
      raise 'Unsupported sort method'
    end

    @groups_projects = paginate @groups_projects
    render json: linked_json(
      @groups_projects,
      WebApi::V1::GroupsProjectSerializer,
      params: fastjson_params,
      include: [:group]
    )
  end

  def show
    render json: WebApi::V1::GroupsProjectSerializer.new(
      @groups_project,
      params: fastjson_params,
      include: [:group]
    ).serializable_hash.to_json
  end

  # insert
  def create
    @groups_project = GroupsProject.new(groups_project_params)
    @groups_project.project_id = params[:project_id]
    authorize @groups_project
    if @groups_project.save
      render json: WebApi::V1::GroupsProjectSerializer.new(
        @groups_project.reload,
        params: fastjson_params,
        include: [:group]
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @groups_project.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    groups_project = @groups_project.destroy
    if groups_project.destroyed?
      head :ok
    else
      head :internal_server_error
    end
  end

  def set_groups_project
    @groups_project = GroupsProject.find params[:id]
    authorize @groups_project
  end

  def groups_project_params
    params.require(:groups_project).permit(
      :group_id
    )
  end
end
