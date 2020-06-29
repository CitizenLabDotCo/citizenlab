class WebApi::V1::ProjectsController < ::ApplicationController
  before_action :set_project, only: [:show, :update, :reorder, :destroy]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    @projects = if params[:filter_can_moderate]
      ProjectPolicy::Scope.new(current_user, Project).moderatable 
    else 
      policy_scope(Project)
    end
    @projects = @projects.where(id: params[:filter_ids]) if params[:filter_ids]  
    @projects = ProjectsFilteringService.new.apply_common_index_filters @projects, params

    @projects = @projects.ordered
      .includes(:project_images, :phases, :areas, :topics, admin_publication: [:children])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    user_baskets = current_user&.baskets
      &.where(participation_context_type: 'Project')
      &.group_by do |basket|
        [basket.participation_context_id, basket.participation_context_type]
      end
    user_baskets ||= {}
    instance_options = {
      user_baskets: user_baskets,
      allocated_budgets: ParticipationContextService.new.allocated_budgets(@projects),
      timeline_active: TimelineService.new.timeline_active_on_collection(@projects),
      visible_children_count_by_parent_id: {} # projects don't have children
    }

    render json: linked_json(
      @projects, 
      WebApi::V1::ProjectSerializer, 
      params: fastjson_params(instance_options), 
      include: [:admin_publication, :project_images, :current_phase, :avatars, :topics]
      )
  end

  def show
    render json: WebApi::V1::ProjectSerializer.new(
      @project, 
      params: fastjson_params, 
      include: [:admin_publication, :project_images, :current_phase, :avatars]
      ).serialized_json
  end

  def by_slug
    @project = Project.find_by!(slug: params[:slug])
    authorize @project
    show
  end

  def create
    params = permitted_attributes(Project)
    @project = Project.new(params.except(:folder_id))
    SideFxProjectService.new.before_create(@project, current_user)

    authorize @project

    saved = nil
    ActiveRecord::Base.transaction do
      saved = @project.save
      if saved
        set_folder! params[:folder_id] if params.key? :folder_id
      end
    end

    if saved
      SideFxProjectService.new.after_create(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project, 
        params: fastjson_params, 
        include: [:admin_publication],
        ).serialized_json, status: :created
    else
      render json: {errors: @project.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    params[:project][:area_ids] ||= [] if params[:project].has_key?(:area_ids)
    params[:project][:default_assignee_id] ||= nil if params[:project].has_key?(:default_assignee_id)

    project_params = permitted_attributes(Project)
    
    @project.assign_attributes project_params.except(:folder_id)
    if project_params.key?(:header_bg) && project_params[:header_bg].nil?
      # setting the header image attribute to nil will not remove the header image
      @project.remove_header_bg!
    end
    authorize @project
    SideFxProjectService.new.before_update(@project, current_user)

    saved = nil
    ActiveRecord::Base.transaction do
      saved = @project.save
      @project.set_folder! project_params[:folder_id] if saved && project_params.key?(:folder_id)
    end
    if saved
      SideFxProjectService.new.after_update(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project, 
        params: fastjson_params, 
        include: [:admin_publication],
        ).serialized_json, status: :ok
    else
      render json: {errors: @project.errors.details}, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def destroy
    SideFxProjectService.new.before_destroy(@project, current_user)
    project = @project.destroy
    if project.destroyed?
      SideFxProjectService.new.after_destroy(project, current_user)
      head :ok
    else
      head 500
    end
  end


  private

  def secure_controller?
    false
  end

  def set_project
    @project = Project.find params[:id]
    authorize @project
  end

end
