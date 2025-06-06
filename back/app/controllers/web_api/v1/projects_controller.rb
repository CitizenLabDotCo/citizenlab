# frozen_string_literal: true

class WebApi::V1::ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update reorder destroy index_xlsx votes_by_user_xlsx votes_by_input_xlsx delete_inputs refresh_preview_token destroy_participation_data]

  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped, only: :index

  def index
    # Hidden community monitor project not included by default via AdminPublication policy scope
    policy_context[:include_hidden] = true if params[:include_hidden] == 'true'

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
  # If :areas param: Returns all non-draft projects that are visible to user, for the selected areas.
  # Else: Returns all non-draft projects that are visible to user, for the areas user follows or for all-areas.
  # Ordered by created_at, newest first.
  def index_for_areas
    projects = policy_scope(Project)
    projects = ProjectsFinderService.new(projects, current_user, params).projects_for_areas

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

  def index_for_admin
    projects = policy_scope(Project)
    projects = ProjectsFinderAdminService.execute(projects, params, current_user: current_user)

    @projects = paginate projects
    @projects = @projects.includes(:project_images, :phases)

    authorize @projects, :index_for_admin?

    render json: linked_json(
      @projects,
      WebApi::V1::ProjectMiniSerializer,
      params: jsonapi_serializer_params({
        project_descriptor_pairs: {}
      }),
      include: %i[project_images current_phase]
    )    
  end

  def show
    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params.merge(use_cache: params[:use_cache], request: request),
      include: %i[admin_publication project_images current_phase avatars]
    ).serializable_hash
  end

  def by_slug
    @project = Project.find_by!(slug: params[:slug])
    authorize @project
    show
  end

  def create
    project = Project.new(permitted_attributes(Project))
    sidefx.before_create(project, current_user)

    created = Project.transaction do
      save_project(project).tap do |saved|
        sidefx.after_create(project, current_user) if saved
      end
    end

    if created
      render json: WebApi::V1::ProjectSerializer.new(
        project,
        params: jsonapi_serializer_params,
        include: [:admin_publication]
      ).serializable_hash, status: :created
    else
      render json: { errors: project.errors.details }, status: :unprocessable_entity
    end
  end

  def copy
    source_project = Project.find(params[:id])
    dest_folder = source_project.folder if UserRoleService.new.can_moderate?(source_project.folder, current_user)

    # The authorization of this action is more complex than usual. It works in two steps:
    # - Check if the user can copy the source project.
    # - Check if the user can create the project that results from the copy.
    # In between these two steps, there is a third authorization check that is an optimization that allows us to
    # return early in some cases.
    authorize(source_project)

    # Optimization: We perform the authorization on a dummy project that resembles the result of the copy. This
    # approach allows us to return early in some cases without performing the actual copy, which can be expensive.
    # The dummy project must be `save`d before the authorization check to ensure the admin publication is created.
    # A final authorization check is performed afterward on the actual copied project.
    Project.transaction do
      source_project.dup.tap do |p|
        p.assign_attributes(
          slug: nil,
          default_assignee_id: nil,
          admin_publication_attributes: {
            publication_status: 'draft',
            parent_id: dest_folder&.admin_publication&.id
          }
        )

        p.save!
        authorize(p, :create?)
      end

      raise ActiveRecord::Rollback
    end

    start_time = Time.now
    project = Project.transaction do
      copy = LocalProjectCopyService.new.copy(source_project, dest_folder: dest_folder)
      authorize(copy, :create?)
    end

    sidefx.after_copy(source_project, project, current_user, start_time)

    render json: WebApi::V1::ProjectSerializer.new(
      project,
      params: jsonapi_serializer_params,
      include: [:admin_publication]
    ).serializable_hash, status: :created
  end

  def update
    params[:project][:area_ids] ||= [] if params[:project].key?(:area_ids)
    params[:project][:topic_ids] ||= [] if params[:project].key?(:topic_ids)

    project_params = permitted_attributes(@project)

    @project.assign_attributes project_params
    remove_image_if_requested!(@project, project_params, :header_bg)

    sidefx.before_update(@project, current_user)

    if save_project(@project)
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
    sidefx.after_destroy_participation_data(@project, current_user)

    render json: WebApi::V1::ProjectSerializer.new(
      @project,
      params: jsonapi_serializer_params,
      include: [:admin_publication]
    ).serializable_hash, status: :ok
  end

  def community_monitor
    project = CommunityMonitorService.new.find_or_create_project(current_user)

    authorize project

    render json: WebApi::V1::ProjectSerializer.new(
      project,
      params: jsonapi_serializer_params.merge(request: request),
      include: %i[current_phase]
    ).serializable_hash
  end

  private

  def sidefx
    @sidefx ||= SideFxProjectService.new
  end

  def save_project(project)
    # Update folder_id only if it is provided in the request (even if it's nil)
    if params[:project].key?(:folder_id)
      project.folder_id = params.dig(:project, :folder_id)
    end

    ActiveRecord::Base.transaction do
      project.save.tap do |saved|
        if saved
          # The project must be saved before performing the authorization because it requires
          # the admin publication to be created.
          authorize(project)
          check_publication_inconsistencies!
        else
          skip_authorization
        end
      end
    end
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
