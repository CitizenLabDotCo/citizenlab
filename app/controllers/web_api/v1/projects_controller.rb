class WebApi::V1::ProjectsController < ::ApplicationController

  before_action :set_project, only: [:show, :update, :destroy]

  def index
    @projects = policy_scope(Project)
      .includes(:project_images)
      .order(created_at: :desc)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @projects = @projects.with_all_areas(params[:areas]) if params[:areas].present?
    @projects = @projects.with_all_topics(params[:topics]) if params[:topics].present?

    render json: @projects, include: ['project_images']
  end

  def show
    render json: @project, include: ['project_images']
  end

  def by_slug
    @project = Project.find_by!(slug: params[:slug])
    authorize @project
    show
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
    params[:project][:area_ids] ||= [] if params[:project].has_key?(:area_ids)
    params[:project][:topic_ids] ||= [] if params[:project].has_key?(:topic_ids)
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
      :visible_to,
      :presentation_mode,
      title_multiloc: I18n.available_locales, 
      description_multiloc: I18n.available_locales,
      description_preview_multiloc: I18n.available_locales,
      area_ids: [],
      topic_ids: []
    )
  end

  def set_project
    @project = Project.find params[:id]
    authorize @project
  end
end
