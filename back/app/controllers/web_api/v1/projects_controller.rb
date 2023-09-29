# frozen_string_literal: true

class WebApi::V1::ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update reorder destroy survey_results submission_count index_xlsx delete_inputs]

  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped, only: :index

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

    user_followers = current_user&.follows
      &.where(followable_type: 'Project')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    instance_options = {
      user_baskets: user_baskets,
      user_followers: user_followers,
      allocated_budgets: ParticipationContextService.new.allocated_budgets(@projects),
      timeline_active: TimelineService.new.timeline_active_on_collection(@projects),
      visible_children_count_by_parent_id: {} # projects don't have children
    }

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectSerializer,
      params: jsonapi_serializer_params(instance_options),
      include: %i[admin_publication project_images current_phase]
    )
  end

  def show
    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params,
      include: %i[admin_publication project_images current_phase permissions]
    ).serializable_hash
  end

  def by_slug
    @project = Project.find_by!(slug: params[:slug])
    authorize @project
    show
  end

  def create
    project_params = permitted_attributes(Project)
    @project = Project.new(project_params)
    sidefx.before_create(@project, current_user)

    if save_project
      sidefx.after_create(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project,
        params: jsonapi_serializer_params,
        include: [:admin_publication]
      ).serializable_hash, status: :created
    else
      render json: { errors: @project.errors.details }, status: :unprocessable_entity
    end
  end

  def copy
    source_project = Project.find(params[:id])
    folder = source_project.folder

    @project = folder ? Project.new(folder: folder) : Project.new

    authorize @project

    start_time = Time.now
    @project = LocalProjectCopyService.new.copy(source_project)

    sidefx.after_copy(source_project, @project, current_user, start_time)

    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params,
      include: [:admin_publication]
    ).serializable_hash, status: :created
  end

  def update
    params[:project][:area_ids] ||= [] if params[:project].key?(:area_ids)
    params[:project][:topic_ids] ||= [] if params[:project].key?(:topic_ids)

    project_params = permitted_attributes(Project)

    @project.assign_attributes project_params
    remove_image_if_requested!(@project, project_params, :header_bg)

    sidefx.before_update(@project, current_user)

    if save_project
      sidefx.after_update(@project, current_user)
      render json: WebApi::V1::ProjectSerializer.new(
        @project,
        params: jsonapi_serializer_params,
        include: [:admin_publication]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @project.errors.details }, status: :unprocessable_entity, include: ['project_images']
    end
  end

  def destroy
    sidefx.before_destroy(@project, current_user)
    if @project.destroy
      sidefx.after_destroy(@project, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def survey_results
    results = SurveyResultsGeneratorService.new(@project).generate_results
    render json: raw_json(results)
  end

  def submission_count
    count = SurveyResultsGeneratorService.new(@project).generate_submission_count
    render json: raw_json(count)
  end

  def index_xlsx
    I18n.with_locale(current_user.locale) do
      include_private_attributes = Pundit.policy!(current_user, User).view_private_attributes?
      xlsx = XlsxExport::GeneratorService.new.generate_inputs_for_project @project.id, include_private_attributes
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'inputs.xlsx'
    end
  end

  def delete_inputs
    sidefx.before_delete_inputs @project, current_user
    ActiveRecord::Base.transaction do
      @project.ideas.each(&:destroy!)
    end
    sidefx.after_delete_inputs @project, current_user
    head :ok
  end

  private

  def sidefx
    @sidefx ||= SideFxProjectService.new
  end

  def save_project
    ActiveRecord::Base.transaction do
      set_folder
      authorize @project
      @project.save
    end
  end

  def set_folder
    return unless params.require(:project).key?(:folder_id)

    @project.folder_id = params.dig(:project, :folder_id)
  end

  def set_project
    @project = Project.find(params[:id])
    authorize @project
  end
end
