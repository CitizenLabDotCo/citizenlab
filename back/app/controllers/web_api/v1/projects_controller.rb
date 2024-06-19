# frozen_string_literal: true

class WebApi::V1::ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update reorder destroy index_xlsx votes_by_user_xlsx votes_by_input_xlsx delete_inputs]

  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped, only: :index

  def index
    publications = policy_scope(AdminPublication)
    publications = AdminPublicationsFilteringService.new.filter(publications, params.merge(current_user: current_user))
      .where(publication_type: Project.name)

    # Not very satisfied with this ping-pong of SQL queries (knowing that the
    # AdminPublicationsFilteringService is also making a request on projects).
    # But could not find a way to eager-load the polymorphic type in the publication
    # scope.

    # `includes` tries to be smart & use joins here, but it makes the query complex and slow. So, we use `preload`.
    # Using `pluck(:publication_id)` instead of `select(:publication_id)` also helps if used with `includes`,
    # but it doesn't make any difference with `preload`. Still using it in case the query changes.
    @projects = Project.where(id: publications.pluck(:publication_id)).ordered
    @projects = paginate @projects
    @projects = @projects.preload(
      :project_images,
      :areas,
      :topics,
      :content_builder_layouts, # Defined in ContentBuilder engine
      phases: [:report, { permissions: [:groups] }],
      admin_publication: [:children]
    )

    user_followers = current_user&.follows
      &.where(followable_type: 'Project')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    instance_options = {
      user_followers: user_followers,
      timeline_active: TimelineService.new.timeline_active_on_collection(@projects.to_a),
      visible_children_count_by_parent_id: {}, # projects don't have children
      permission_service: Permissions::ProjectPermissionsService.new
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
      include: %i[admin_publication project_images current_phase avatars]
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

  def index_xlsx
    I18n.with_locale(current_user.locale) do
      xlsx = XlsxExport::InputsGenerator.new.generate_inputs_for_project @project.id, view_private_attributes: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'inputs.xlsx'
    end
  end

  def votes_by_user_xlsx
    if @project.phases.where(participation_method: 'voting').present?
      I18n.with_locale(current_user&.locale) do
        xlsx = XlsxExport::ProjectBasketsVotesGenerator.new.generate_project_baskets_votes_xlsx(@project)
        send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: 'votes_by_user.xlsx'
      end

      sidefx.after_votes_by_user_xlsx(@project, current_user)
    else
      raise 'Project has no voting phase.'
    end
  end

  def votes_by_input_xlsx
    if @project.phases.where(participation_method: 'voting').present?
      I18n.with_locale(current_user&.locale) do
        xlsx = XlsxExport::ProjectIdeasVotesGenerator.new.generate_project_ideas_votes_xlsx @project
        send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: 'votes_by_input.xlsx'
      end

      sidefx.after_votes_by_input_xlsx(@project, current_user)
    else
      raise 'Project has no voting phase.'
    end
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
