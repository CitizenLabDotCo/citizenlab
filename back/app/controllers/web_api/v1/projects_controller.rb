# frozen_string_literal: true

class WebApi::V1::ProjectsController < ::ApplicationController
  before_action :set_context, only: %i[show update reorder destroy survey_results submission_count delete_inputs]
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped, only: :index

  define_callbacks :save_project

  def index
    params['moderator'] = current_user if params[:filter_can_moderate]

    publications = policy_scope(AdminPublication)
    publications = AdminPublicationsFilteringService.new.filter(publications, params)
      .where(publication_type: Project.name)

    # Not very satisfied with this ping-pong of SQL queries (knowing that the
    # AdminPublicationsFilteringService is also making a request on projects).
    # But could not find a way to eager-load the polymorphic type in the publication
    # scope.

    @projects = Project.where(id: publications.select(:publication_id))
      .ordered
      .includes(:project_images, :phases, :areas, admin_publication: [:children])
    @projects = paginate @projects

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
      @context,
      params: fastjson_params,
      include: %i[admin_publication project_images current_phase]
    ).serialized_json
  end

  def by_slug
    @context = Project.find_by!(slug: params[:slug])
    authorize @context
    show
  end

  def create
    project_params = permitted_attributes(Project)
    @context = Project.new(project_params)
    sidefx.before_create(@context, current_user)

    if save_project
      sidefx.after_create(@context, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @context,
        params: fastjson_params,
        include: [:admin_publication]
      ).serialized_json, status: :created
    else
      render json: { errors: @context.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    params[:project][:area_ids] ||= [] if params[:project].key?(:area_ids)
    params[:project][:topic_ids] ||= [] if params[:project].key?(:topic_ids)

    project_params = permitted_attributes(Project)

    @context.assign_attributes project_params
    remove_image_if_requested!(@context, project_params, :header_bg)

    sidefx.before_update(@context, current_user)

    if save_project
      sidefx.after_update(@context, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @context,
        params: fastjson_params,
        include: [:admin_publication]
      ).serialized_json, status: :ok
    else
      render json: { errors: @context.errors.details }, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def destroy
    sidefx.before_destroy(@context, current_user)
    if @context.destroy
      sidefx.after_destroy(@context, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def survey_results
    results = SurveyResultsGeneratorService.new(@context).generate_results
    render json: results
  end

  def submission_count
    count = SurveyResultsGeneratorService.new(@context).generate_submission_count
    render json: count
  end

  def delete_inputs
    sidefx.before_delete_inputs @context, current_user
    ActiveRecord::Base.transaction do
      @context.ideas.each(&:destroy!)
    end
    sidefx.before_delete_inputs @context, current_user
    head :ok
  end

  private

  def sidefx
    @sidefx ||= SideFxProjectService.new
  end

  def save_project
    ActiveRecord::Base.transaction do
      run_callbacks(:save_project) do
        # authorize is placed within the block so we can prepare
        # the @context to be authorized from a callback.
        authorize @context
        @context.save
      end
    end
  end

  def set_context
    @context = Project.find(params[:id])
    authorize @context
  end
end

WebApi::V1::ProjectsController.include_if_ee('ProjectFolders::WebApi::V1::Patches::ProjectsController')
