# frozen_string_literal: true

class WebApi::V1::ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update reorder destroy index_xlsx votes_by_user_xlsx votes_by_input_xlsx delete_inputs refresh_preview_token destroy_participation_data]

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
      user_requirements_service: Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    }

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectSerializer,
      params: jsonapi_serializer_params(instance_options),
      include: %i[admin_publication project_images current_phase]
    )
  end

  # For use with 'Finished or archived' homepage widget. Uses ProjectMiniSerializer.
  # Returns projects that are either ( published AND (finished OR have a last phase that contains a report))
  # OR are archived, ordered by last phase end_at (nulls first), creation date second and ID third.
  # => [Project]
  def index_finished_or_archived
    projects = policy_scope(Project)
    projects = ProjectsFinderService.new(projects, current_user, params).finished_or_archived

    @projects = paginate projects
    @projects = @projects.includes(:project_images, phases: [:report, { permissions: [:groups] }])

    authorize @projects, :index_finished_or_archived?

    base_render_mini_index
  end

  # For use with 'For you' homepage widget. Uses ProjectMiniSerializer.
  # Returns all published projects that are visible to user
  # AND (are followed by user OR relate to an idea, area, topic or folder followed by user),
  # ordered by the follow created_at (most recent first).
  def index_for_followed_item
    projects = policy_scope(Project)
    projects = projects.not_draft
    projects = ProjectsFinderService.new(projects, current_user).followed_by_user

    @projects = paginate projects
    @projects = @projects.includes(:project_images, phases: [:report, { permissions: [:groups] }])

    authorize @projects, :index_for_followed_item?

    base_render_mini_index
  end

  # For use with 'Open to participation' homepage widget. Uses ProjectMiniSerializer.
  # Returns all published projects that are visible to user
  # AND in an active participatory phase (where user can do something).
  # Ordered by the end date of the current phase, soonest first (nulls last).
  def index_with_active_participatory_phase
    projects = policy_scope(Project)
    projects_and_descriptors = ProjectsFinderService.new(projects, current_user, params).participation_possible
    projects = projects_and_descriptors[:projects]

    @projects = paginate projects
    @projects = @projects.includes(:project_images, phases: [:report, { permissions: [:groups] }])

    authorize @projects, :index_with_active_participatory_phase?

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectMiniSerializer,
      params: jsonapi_serializer_params.merge(project_descriptor_pairs: projects_and_descriptors[:descriptor_pairs]),
      include: %i[project_images current_phase]
    )
  end

  # For use with 'Areas or topics' homepage widget. Uses ProjectMiniSerializer.
  # Returns all non-draft projects that are visible to user, for the selected areas.
  # Ordered by created_at, newest first.
  def index_for_areas
    projects = policy_scope(Project)
    projects = projects.not_draft

    projects = if params[:areas].present?
      projects.where(include_all_areas: true).or(projects.with_some_areas(params[:areas]))
    else
      subquery = Follower
        .where(user_id: current_user&.id)
        .where.not(followable_type: 'Initiative')
        .joins(
          'LEFT JOIN areas AS followed_areas ON followers.followable_type = \'Area\' ' \
          'AND followed_areas.id = followers.followable_id'
        )
        .joins('LEFT JOIN areas_projects ON areas_projects.area_id = followed_areas.id')
        .joins(
          'INNER JOIN projects ON areas_projects.project_id = projects.id'
        )
        .select('projects.id AS project_id')

      projects.where(include_all_areas: true).or(projects.where(id: subquery))
    end

    projects = projects.order(created_at: :desc)

    @projects = paginate projects
    @projects = @projects.includes(:project_images, phases: [:report, { permissions: [:groups] }])

    authorize @projects, :index_for_areas?

    base_render_mini_index
  end

  # For use with 'Areas or topics' homepage widget. Uses ProjectMiniSerializer.
  # Returns all non-draft projects that are visible to user, for the selected topics.
  # Ordered by created_at, newest first.
  def index_for_topics
    projects = policy_scope(Project)
    projects = projects
      .not_draft
      .with_some_topics(params[:topics])
      .order(created_at: :desc)

    @projects = paginate projects
    @projects = @projects.includes(:project_images, phases: [:report, { permissions: [:groups] }])

    authorize @projects, :index_for_topics?

    base_render_mini_index
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

  def refresh_preview_token
    @project.refresh_preview_token

    sidefx.before_update(@project, current_user)
    @project.save!
    sidefx.after_update(@project, current_user)

    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params,
      include: [:admin_publication]
    ).serializable_hash, status: :ok
  end

  def index_xlsx
    I18n.with_locale(current_user.locale) do
      xlsx = Export::Xlsx::InputsGenerator.new.generate_inputs_for_project @project.id
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

  def destroy_participation_data
    ParticipantsService.new.destroy_participation_data(@project)

    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params,
      include: [:admin_publication]
    ).serializable_hash, status: :ok
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

  def base_render_mini_index
    render json: linked_json(
      @projects,
      WebApi::V1::ProjectMiniSerializer,
      params: jsonapi_serializer_params({
        user_requirements_service: Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      }),
      include: %i[project_images current_phase]
    )
  end
end

WebApi::V1::ProjectsController.include(AggressiveCaching::Patches::WebApi::V1::ProjectsController)
