class Api::V1::ProjectsController < ::ApplicationController

  before_action :set_project, only: [:show, :update, :destroy]

  def index
    @projects = policy_scope(Project)
      .includes(:project_images)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @projects, include: ['project_images']
  end

  def show
    render json: @project, include: ['project_images']
  end

  def create
    @project = Project.new(project_params)
    authorize @project
    if @project.save
      render json: @project, status: :created
    else
      render json: {errors: @project.errors.details}, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def update
    if @project.update(project_params)
      render json: @project, status: :ok
    else
      render json: {errors: @project.errors.details}, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def destroy
    @project.destroy
    head :ok
  end

  private

  def secure_controller?
    false
  end

  def project_params
    params.require(:project).permit(
      :slug, 
      :header_bg,
      title_multiloc: I18n.available_locales, 
      description_multiloc: I18n.available_locales
    )
  end

  def set_project
    @project = Project.find params[:id]
    authorize @project
  end
end
