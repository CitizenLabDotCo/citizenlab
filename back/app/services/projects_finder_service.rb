class ProjectsFinderService
  def initialize(projects, user = nil, params = {})
    @projects = projects.not_hidden
    @user = user
    @page_size = (params.dig(:page, :size) || 500).to_i
    @page_number = (params.dig(:page, :number) || 1).to_i
    @filter_by = params[:filter_by]
    @areas = params[:areas]
  end

  # Returns an ActiveRecord collection of published projects with an active
  # participatory phase in which the user can (probably) participate, ordered
  # by the end date of that phase, soonest first (nulls last).
  def participation_possible
    project_ids = []

    active_participatory_phases.each do |phase|
      next if project_ids.include?(phase.project_id)
      next if !participation_possible_for?(phase)

      project_ids << phase.project_id
      break if project_ids.size >= max_needed_projects
    end

    return Project.none if project_ids.empty?

    Project.in_order_of(:id, project_ids)
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
        'LEFT JOIN global_topics AS followed_global_topics ON followers.followable_type = \'GlobalTopic\' ' \
        'AND followed_global_topics.id = followers.followable_id'
      )
      .joins('LEFT JOIN projects_global_topics ON projects_global_topics.global_topic_id = followed_global_topics.id')
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
        'OR (projects_global_topics.project_id = projects.id) ' \
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
  # @return [Project::ActiveRecord_Relation]
  def finished_or_archived
    return @projects unless @filter_by.in? %w[finished archived finished_and_archived]

    result = @projects.none
    base_scope = @projects.joins(:phases).not_in_draft_folder

    if @filter_by.in? %w[finished finished_and_archived]
      published_scope = base_scope.where(admin_publication: AdminPublication.published)
      finished_scope = joins_last_phases_with_reports(published_scope).where(<<~SQL.squish, Time.zone.now)
        last_phases.last_phase_end_at <= ? OR (reports.id IS NOT NULL AND reports.visible = true)
      SQL
      result = result.or(finished_scope)
    end

    if @filter_by.in? %w[archived finished_and_archived]
      archived_scope = base_scope.where(admin_publication: AdminPublication.archived)
      archived_scope = joins_last_phases_with_reports(archived_scope)
      result = result.or(archived_scope)
    end

    order_by_created_at_and_id_with_distinct_on(result)
  end

  private

  def participation_possible_for?(phase)
    Permissions::PhasePermissionsService.new(
      phase, @user, user_requirements_service: user_requirements_service
    ).participation_possible?
  end

  def active_participatory_phases
    candidates = @projects
      .not_in_draft_folder
      .where(admin_publication: AdminPublication.published)

    Phase.current
      .where.not(participation_method: 'information')
      .joins(:project)
      .where(project_id: candidates.select(:id))
      .order(Arel.sql('phases.end_at ASC NULLS LAST, projects.created_at ASC, projects.id ASC'))
      .preload(permissions: [:groups], project: :admin_publication)
  end

  # One more project than fits the requested page, so pagination can tell
  # whether there is a next page.
  def max_needed_projects
    (@page_size * @page_number) + 1
  end

  def order_by_created_at_and_id_with_distinct_on(projects)
    ordered_projects_cte = projects
      .select('DISTINCT ON (last_phase_end_at, projects.created_at, projects.id) projects.*, last_phase_end_at')
      .order('last_phase_end_at DESC, projects.created_at ASC, projects.id ASC')

    Project.with(ordered_projects: ordered_projects_cte)
      .from('ordered_projects AS projects')
      .order('last_phase_end_at DESC, created_at ASC, id ASC')
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
