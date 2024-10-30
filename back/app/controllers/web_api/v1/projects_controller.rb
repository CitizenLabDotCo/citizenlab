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
      user_requirements_service: user_requirements_service
    }

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectSerializer,
      params: jsonapi_serializer_params(instance_options),
      include: %i[admin_publication project_images current_phase]
    )
  end

  # For use with 'Open to participation' homepage widget.
  # Returns all published or archived projects that are visible to user
  # and in an active participatory phase (where user can do something).
  # Ordered by the end date of the current phase, soonest first (nulls last).
  def index_projects_with_active_participatory_phase
    # Projects user can see, with active participatory (not information) phase & include the phases.end_at column
    # We could use the ProjectPermissionSevice step to filter for active phases, but doing it here is more efficient.
    subquery = policy_scope(Project)
      .joins('INNER JOIN admin_publications AS admin_publications ON admin_publications.publication_id = projects.id')
      .where(admin_publications: { publication_status: 'published' })
      .joins('INNER JOIN phases AS phases ON phases.project_id = projects.id')
      .where(
        'phases.start_at <= ? AND (phases.end_at >= ? OR phases.end_at IS NULL) AND phases.participation_method != ?',
        Time.zone.now.to_fs(:db), Time.zone.now.to_fs(:db), 'information'
      )
      .select('projects.*, phases.end_at AS phase_end_at')

    # Perform the SELECT DISTINCT on the outer query
    @projects = Project
      .from(subquery, :projects)
      .distinct
      .order('phase_end_at ASC NULLS LAST')
      .preload(phases: { permissions: [:groups] })

    # Projects user can participate in, or where such participation could (probably) be made possible by user
    # (e.g. user not signed in).
    # Unfortunately, this breaks the query chain, so we have to start a new one after this.
    # Also, we will need the action descriptors again later, so we will store them.

    # # Step 1: Create pairs of project ids and action descriptors.
    # # Since this is the last filtering step, we will keep going
    # # until we reach the limit required for pagination.
    pagination_limit = calculate_pagination_limit

    project_descriptor_pairs = @projects.each_with_object({}) do |project, acc|
      service = Permissions::ProjectPermissionsService.new(
        project, current_user, user_requirements_service: user_requirements_service
      )
      action_descriptors = service.action_descriptors

      if Permissions::ProjectPermissionsService.participation_possible?(action_descriptors)
        acc[project.id] = action_descriptors
        break if acc.size >= pagination_limit
      end
    end

    # # Step 2: Use these to filter out projects
    project_ids = project_descriptor_pairs.keys
    @projects = @projects.where(id: project_ids)

    # `includes` tries to be smart & use joins here, but it makes the query complex and slow. So, we use `preload`.
    @projects = paginate @projects
    @projects = @projects.preload(
      :project_images,
      phases: [:report]
    )

    authorize @projects, :index_projects_with_active_participatory_phase?

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectMiniSerializer,
      params: jsonapi_serializer_params.merge(project_descriptor_pairs: project_descriptor_pairs),
      include: %i[project_images current_phase]
    )
  end

  def show
    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params.merge(use_cache: params[:use_cache]),
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
      xlsx = Export::Xlsx::InputsGenerator.new.generate_inputs_for_project @project.id, view_private_attributes: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'inputs.xlsx'
    end
  end

  def votes_by_user_xlsx
    if @project.phases.where(participation_method: 'voting').present?
      I18n.with_locale(current_user&.locale) do
        xlsx = Export::Xlsx::ProjectBasketsVotesGenerator.new.generate_project_baskets_votes_xlsx(@project)
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
        xlsx = Export::Xlsx::ProjectIdeasVotesGenerator.new.generate_project_ideas_votes_xlsx @project
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
      saved = @project.save
      check_publication_inconsistencies! if saved
      saved
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

  def check_publication_inconsistencies!
    # This code is meant to be temporary to find the cause of the disappearing admin publication bugs
    Project.all.each do |project|
      next if project.valid?

      errors = project&.errors&.details

      # Skip a known case where we expect project to be invalid at this point
      moved_folder = project.admin_publication&.parent_id_was == project.folder_id
      assignee_error_only = errors == { :default_assignee_id => [{ :error => :assignee_can_not_moderate_project }] }
      next if assignee_error_only && moved_folder

      # Validation errors will appear in the Sentry error 'Additional Data'
      ErrorReporter.report_msg("Project change would lead to inconsistencies! (id: #{project.id})", extra: errors || {})
    end
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
  end

  def calculate_pagination_limit
    page_size = (params.dig(:page, :size) || 500).to_i
    page_number = (params.dig(:page, :number) || 1).to_i

    page_size * page_number
  end
end

WebApi::V1::ProjectsController.include(AggressiveCaching::Patches::WebApi::V1::ProjectsController)
