class WebApi::V1::ProjectsController < ::ApplicationController
  before_action :set_project, only: %i[show update reorder destroy]
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped, only: :index

  define_callbacks :save_project

  def index
    params["moderator"] = current_user if params[:filter_can_moderate]

    publications = policy_scope(AdminPublication)
    publications = AdminPublicationsFilteringService.new.filter(publications, params)
                                                 .where(publication_type: Project.name)

    # Not very satisfied with this ping-pong of SQL queries (knowing that the
    # AdminPublicationsFilteringService is also making a request on projects).
    # But could not find a way to eager-load the polymorphic type in the publication
    # scope.

    @projects = Project.where(id: publications.select(:publication_id))
                       .includes(:project_images, :phases, :areas, admin_publication: [:children])
    @projects = paginate @projects

    if params[:search].present?
      @projects = @projects.search_by_all(params[:search])
    else
      @projects = @projects.ordered
    end

    LogActivityJob.perform_later(current_user, 'searched_projects', current_user, Time.now.to_i, payload: {search_query: params[:search]}) if params[:search].present?

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
      include: %i[admin_publication project_images current_phase]
    )
  end

  def show
    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: fastjson_params,
      include: %i[admin_publication project_images current_phase]
    ).serialized_json
  end

  def by_slug
    @project = Project.find_by!(slug: params[:slug])
    authorize @project
    show
  end

  def create
    project_params = permitted_attributes(Project)
    @project = Project.new(project_params)
    SideFxProjectService.new.before_create(@project, current_user)

    if save_project
      SideFxProjectService.new.after_create(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project,
        params: fastjson_params,
        include: [:admin_publication]
      ).serialized_json, status: :created
    else
      render json: { errors: @project.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    sidefx = SideFxProjectService.new

    params[:project][:area_ids] ||= [] if params[:project].key?(:area_ids)
    params[:project][:topic_ids] ||= [] if params[:project].key?(:topic_ids)

    project_params = permitted_attributes(Project)

    @project.assign_attributes project_params
    if project_params.key?(:header_bg) && project_params[:header_bg].nil?
      # setting the header image attribute to nil will not remove the header image
      @project.remove_header_bg!
    end
    sidefx.before_update(@project, current_user)

    if save_project
      sidefx.after_update(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project,
        params: fastjson_params,
        include: [:admin_publication]
      ).serialized_json, status: :ok
    else
      render json: { errors: @project.errors.details }, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def destroy
    SideFxProjectService.new.before_destroy(@project, current_user)
    if @project.destroy
      SideFxProjectService.new.after_destroy(@project, current_user)
      head :ok
    else
      head 500
    end
  end

  private

  def save_project
    ActiveRecord::Base.transaction do
      run_callbacks(:save_project) do
        # authorize is placed within the block so we can prepare
        # the @project to be authorized from a callback.
        authorize @project
        @project.save
      end
    end
  end

  def set_project
    @project = Project.find(params[:id])
    authorize @project
  end
end

WebApi::V1::ProjectsController.include_if_ee('ProjectFolders::WebApi::V1::Patches::ProjectsController')
