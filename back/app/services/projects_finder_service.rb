class ProjectsFinderService
  def initialize(projects, user = nil, params = {})
    @projects = projects.not_hidden
    @user = user
    @page_size = (params.dig(:page, :size) || 500).to_i
    @page_number = (params.dig(:page, :number) || 1).to_i
    @filter_by = params[:filter_by]
    @areas = params[:areas]
    @start_at = params[:start_at]
    @end_at = params[:end_at]
  end

  # Returns an ActiveRecord collection of published projects that are
  # in an active participatory phase (where user can probably do something),
  # ordered by the end date of the current phase, soonest first (nulls last).
  # Also returns action descriptors for each project, to avoid getting them again when serializing.
  # => { projects: [Project], descriptor_pairs: { <project.id>: { <action_descriptors> }, ... } }
  def participation_possible
    subquery = @projects
      .not_in_draft_folder # This includes a LEFT OUTER JOIN with admin_publications
      .where(admin_publications: { publication_status: 'published' })

    # Projects with active participatory (not information) phase & include the phases.end_at column
    subquery = projects_with_active_phase(subquery)
      .joins('INNER JOIN phases AS active_phases ON active_phases.project_id = projects.id')
      .where.not(phases: { participation_method: 'information' })
      .select('projects.created_at AS projects_created_at, projects.id AS projects_id')

    # Perform the SELECT DISTINCT on the outer query and order first by the end date of the active phase,
    # second by project created_at, and third by project ID.
    # Secondary & ternary orderings prevent duplicates when paginating, when prior ordering involves equivalent values
    projects = Project
      .from(subquery, :projects)
      .distinct
      .order('phase_end_at ASC NULLS LAST, projects_created_at ASC, projects_id ASC')
      .preload(phases: { permissions: [:groups] })

    # Projects user can participate in, or where such participation could (probably) be made possible by user
    # (e.g. user not signed in).
    # Unfortunately, this breaks the query chain, so we have to start a new one after this.
    #
    # Step 1: Create pairs of project ids and action descriptors.
    # Since this is the last filtering step, we will keep going, until we reach the limit required for pagination.
    pagination_limit = @page_size * @page_number
    project_descriptor_pairs = {}

    projects.each do |project|
      service = Permissions::ProjectPermissionsService.new(
        project, @user, user_requirements_service: user_requirements_service
      )
      action_descriptors = service.action_descriptors
      next unless service.participation_possible?(action_descriptors)

      project_descriptor_pairs[project.id] = action_descriptors
      break if project_descriptor_pairs.size >= pagination_limit + 1 # +1 needed to produce pagination link to next page
    end

    # Step 2: Use project_descriptor_pairs keys (project IDs) to filter projects
    projects = Project.where(id: project_descriptor_pairs.keys)

    # We join with active phases again, to reorder by phases.end_at first, projects.created_at second, project ID third.
    # Secondary & ternary orderings prevent duplicates when paginating, when prior ordering involves equivalent values.
    projects = projects_with_active_phase(projects)
      .order('phase_end_at ASC NULLS LAST, projects.created_at ASC, projects.id ASC')

    # We pass the action descriptors to the serializer to avoid needing to get them again when serializing,
    # so we return them along with the filtered projects.
    { projects: projects, descriptor_pairs: project_descriptor_pairs }
  end

  # Returns an ActiveRecord collection of published projects that are also
  # followed by user OR relate to an idea, area, topic or folder followed by user,
  # ordered by the follow created_at (most recent first).
  # => [Project]
  def followed_by_user
    # return empty collection if user is not signed in
    return Project.none unless @user

    subquery = Follower
      .where(user_id: @user.id)
      .joins(
        'LEFT JOIN areas AS followed_areas ON followers.followable_type = \'Area\' ' \
        'AND followed_areas.id = followers.followable_id'
      )
      .joins('LEFT JOIN areas_projects ON areas_projects.area_id = followed_areas.id')
      .joins(
        'LEFT JOIN topics AS followed_topics ON followers.followable_type = \'Topic\' ' \
        'AND followed_topics.id = followers.followable_id'
      )
      .joins('LEFT JOIN projects_topics ON projects_topics.topic_id = followed_topics.id')
      .joins(
        'LEFT JOIN ideas AS followed_ideas ON followers.followable_type = \'Idea\' ' \
        'AND followed_ideas.id = followers.followable_id'
      )
      .joins('LEFT JOIN project_folders_folders AS followed_folders ON ' \
             'followers.followable_type = \'ProjectFolders::Folder\' ' \
             'AND followed_folders.id = followers.followable_id')
      .joins('LEFT JOIN admin_publications AS parents ON followed_folders.id = parents.publication_id ')
      .joins('LEFT JOIN admin_publications AS children ON parents.id = children.parent_id ')
      .joins(
        'INNER JOIN projects ON ' \
        '(followers.followable_type = \'Project\' AND followers.followable_id = projects.id) ' \
        'OR (areas_projects.project_id = projects.id) ' \
        'OR (projects_topics.project_id = projects.id) ' \
        'OR (followed_ideas.project_id = projects.id)' \
        'OR (children.publication_id = projects.id)'
      )
      .select('projects.id AS project_id, MAX(followers.created_at) AS latest_follower_created_at')
      .group('projects.id')

    @projects
      .joins("INNER JOIN (#{subquery.to_sql}) AS subquery ON projects.id = subquery.project_id")
      .select('projects.*, subquery.latest_follower_created_at')
      .not_in_draft_folder
      .order('subquery.latest_follower_created_at DESC')
  end

  # Returns an ActiveRecord collection of published projects, visible to user, that are also
  # If :areas param: Returns all non-draft projects that are visible to user, for the selected areas.
  # Else: Returns all non-draft projects that are visible to user, for the areas the user follows or for all-areas.
  # Ordered by created_at, newest first.
  # # => [Project]
  def projects_for_areas
    @projects = @projects.not_draft.not_in_draft_folder

    projects = if @areas.present?
      @projects.where(include_all_areas: true).or(@projects.with_some_areas(@areas))
    else
      subquery = Follower
        .where(user_id: @user&.id)
        .joins(
          'LEFT JOIN areas AS followed_areas ON followers.followable_type = \'Area\' ' \
          'AND followed_areas.id = followers.followable_id'
        )
        .joins('LEFT JOIN areas_projects ON areas_projects.area_id = followed_areas.id')
        .joins('INNER JOIN projects ON areas_projects.project_id = projects.id')
        .select('projects.id AS project_id')

      @projects.where(include_all_areas: true).or(@projects.where(id: subquery))
    end

    projects.order(created_at: :desc)
  end

  # Returns ActiveRecord collection of projects that are either (finished OR have a last phase that contains a report)
  # OR are archived, ordered by last phase end_at (nulls first), creation date second and ID third.
  # => [Project]
  def finished_or_archived
    base_scope = @projects
      .joins('INNER JOIN admin_publications AS admin_publications ON admin_publications.publication_id = projects.id')
      .joins('INNER JOIN phases ON phases.project_id = projects.id')
      .not_in_draft_folder

    include_finished = %w[finished finished_and_archived].include?(@filter_by)
    include_archived = %w[archived finished_and_archived].include?(@filter_by)

    if include_finished
      finished_scope = base_scope.where(admin_publications: { publication_status: 'published' })
      finished_scope = joins_last_phases_with_reports(finished_scope)
        .where(
          '(last_phases.last_phase_end_at < ? OR (reports.id IS NOT NULL AND reports.visible = true))' \
          "AND admin_publications.publication_status = 'published'",
          Time.zone.now
        )
    end

    if include_archived
      archived_scope = base_scope.where(admin_publications: { publication_status: 'archived' })
      archived_scope = joins_last_phases_with_reports(archived_scope)
    end

    if include_finished && include_archived
      return order_by_created_at_and_id_with_distinct_on(finished_scope.or(archived_scope))
    end

    return order_by_created_at_and_id_with_distinct_on(finished_scope) if include_finished

    order_by_created_at_and_id_with_distinct_on(archived_scope)
  end

  def projects_back_office
    @projects
      .joins("LEFT JOIN phases AS phases ON phases.project_id = projects.id")
      .where(
        "(phases.start_at, coalesce(phases.end_at, 'infinity'::DATE)) OVERLAPS (?, ?)", 
        @start_at, @end_at
      )
      .order('phases.start_at ASC')
  end

  private

  def projects_with_active_phase(projects)
    projects
      .joins('INNER JOIN phases AS phases ON phases.project_id = projects.id')
      .where(
        'phases.start_at <= ? AND (phases.end_at >= ? OR phases.end_at IS NULL)',
        Time.zone.now.to_fs(:db), Time.zone.now.to_fs(:db)
      )
      .select('projects.*, phases.end_at AS phase_end_at')
  end

  def order_by_created_at_and_id_with_distinct_on(projects)
    projects
      .select('DISTINCT ON (last_phase_end_at, projects.created_at, projects.id) projects.*')
      .order('last_phase_end_at DESC, projects.created_at ASC, projects.id ASC') # secondary ordering by ID prevents duplicates when paginating
  end

  def joins_last_phases_with_reports(projects)
    projects
      .joins(
        'LEFT JOIN LATERAL (' \
        'SELECT phases.id AS last_phase_id, phases.end_at AS last_phase_end_at ' \
        'FROM phases ' \
        'WHERE phases.project_id = projects.id ' \
        'ORDER BY phases.end_at DESC ' \
        'LIMIT 1' \
        ') AS last_phases ON true'
      )
      .joins(
        'LEFT JOIN report_builder_reports AS reports ON reports.phase_id = last_phases.last_phase_id'
      )
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
  end
end
