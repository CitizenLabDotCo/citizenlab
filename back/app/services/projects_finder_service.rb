class ProjectsFinderService
  def initialize(projects, user = nil, params = {})
    @projects = projects
    @user = user
    @page_size = (params.dig(:page, :size) || 500).to_i
    @page_number = (params.dig(:page, :number) || 1).to_i
  end

  # Returns an ActiveRecord collection of published projects that are also
  # followed by user OR relate to an idea, area or topic followed by user,
  # ordered by the follow created_at (most recent first).
  # => [Project]
  def followed_by_user
    subquery = @projects
      .joins('INNER JOIN admin_publications AS admin_publications ON admin_publications.publication_id = projects.id')
      .where(admin_publications: { publication_status: 'published' })
      .joins(
        'LEFT JOIN followers AS project_followers ON project_followers.followable_id = projects.id ' \
        'AND project_followers.followable_type = \'Project\''
      )
      .joins('LEFT JOIN ideas ON ideas.project_id = projects.id')
      .joins(
        'LEFT JOIN followers AS idea_followers ON idea_followers.followable_id = ideas.id ' \
        'AND idea_followers.followable_type = \'Idea\''
      )
      .joins(
        'LEFT JOIN areas_projects ON areas_projects.project_id = projects.id'
      )
      .joins(
        'LEFT JOIN followers AS area_followers ON area_followers.followable_id = areas_projects.area_id ' \
        'AND area_followers.followable_type = \'Area\''
      )
      .joins(
        'LEFT JOIN projects_topics ON projects_topics.project_id = projects.id'
      )
      .joins(
        'LEFT JOIN followers AS topic_followers ON topic_followers.followable_id = projects_topics.topic_id ' \
        'AND topic_followers.followable_type = \'Topic\''
      )
      .where(
        'project_followers.user_id = :user_id OR idea_followers.user_id = :user_id ' \
        'OR area_followers.user_id = :user_id OR topic_followers.user_id = :user_id',
        user_id: @user.id
      )
      .select(
        'projects.id AS project_id, ' \
        'MAX(GREATEST(' \
        'COALESCE(project_followers.created_at, \'1970-01-01\'), ' \
        'COALESCE(idea_followers.created_at, \'1970-01-01\'), ' \
        'COALESCE(area_followers.created_at, \'1970-01-01\'), ' \
        'COALESCE(topic_followers.created_at, \'1970-01-01\')' \
        ')) AS greatest_created_at'
      )
      .group('projects.id')

    # The rather counter-intuitive `.group('projects.id')` at the end of the preceding subquery, followed by
    # this join with the projects table, is necessary to avoid introducing duplicates AND maintain the desired ordering.
    # For example, if a user follows an area for a project and the project is also associated with another area,
    # the project would appear twice in the results without this approach.
    Project
      .from("(#{subquery.to_sql}) AS subquery")
      .joins('INNER JOIN projects ON projects.id = subquery.project_id')
      .select('projects.*, subquery.greatest_created_at')
      .order(
        Arel.sql('subquery.greatest_created_at DESC')
      )
  end

  def participation_possible
    return participation_possible_uncached if @user

    Rails.cache.fetch(
      "#{@projects.cache_key}projects_finder_service/participation_possible/",
      expires_in: 1.hour
    ) do
      participation_possible_uncached
    end
  end

  private

  # Returns an ActiveRecord collection of published projects that are
  # in an active participatory phase (where user can probably do something),
  # ordered by the end date of the current phase, soonest first (nulls last).
  # Also returns action descriptors for each project, to avoid getting them again when serializing.
  # => { projects: [Project], descriptor_pairs: { <project.id>: { <action_descriptors> }, ... } }
  def participation_possible_uncached
    subquery = @projects
      .joins('INNER JOIN admin_publications AS admin_publications ON admin_publications.publication_id = projects.id')
      .where(admin_publications: { publication_status: 'published' })

    # Projects with active participatory (not information) phase & include the phases.end_at column
    subquery = projects_with_active_phase(subquery)
      .joins('INNER JOIN phases AS active_phases ON active_phases.project_id = projects.id')
      .where.not(phases: { participation_method: 'information' })
      .select('projects.*')

    # Perform the SELECT DISTINCT on the outer query and order by the end date of the active phase.
    projects = Project
      .from(subquery, :projects)
      .distinct
      .order('phase_end_at ASC NULLS LAST')
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
      break if project_descriptor_pairs.size >= pagination_limit
    end

    # Step 2: Use project_descriptor_pairs keys (project IDs) to filter projects
    projects = Project.where(id: project_descriptor_pairs.keys)

    # We join with active phases again here, to reorder by their end dates.
    projects = projects_with_active_phase(projects)
      .order('phase_end_at ASC NULLS LAST')

    # We pass the action descriptors to the serializer to avoid needing to get them again when serializing,
    # so we return them along with the filtered projects.
    { projects: projects, descriptor_pairs: project_descriptor_pairs }
  end

  def projects_with_active_phase(projects)
    projects
      .joins('INNER JOIN phases AS phases ON phases.project_id = projects.id')
      .where(
        'phases.start_at <= ? AND (phases.end_at >= ? OR phases.end_at IS NULL)',
        Time.zone.now.to_fs(:db), Time.zone.now.to_fs(:db)
      )
      .select('projects.*, phases.end_at AS phase_end_at')
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
  end
end
