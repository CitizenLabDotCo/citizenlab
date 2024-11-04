class ProjectsFinderService
  # For use with 'Open to participation' homepage widget.
  # Returns all published or archived projects that are visible to user
  # and in an active participatory phase (where user can do something).
  # Ordered by the end date of the current phase, soonest first (nulls last).
  def participation_possible(projects, current_user, params)
    subquery = projects
      .joins('INNER JOIN admin_publications AS admin_publications ON admin_publications.publication_id = projects.id')
      .where(admin_publications: { publication_status: 'published' })

    # Projects with active participatory (not information) phase & include the phases.end_at column
    subquery = projects_with_active_phase(subquery)
      .joins('INNER JOIN phases AS active_phases ON active_phases.project_id = projects.id')
      .where.not(phases: { participation_method: 'information' })
      .select('projects.*')

    # Perform the SELECT DISTINCT on the outer query
    projects = Project
      .from(subquery, :projects)
      .distinct
      .order('phase_end_at ASC NULLS LAST')
      .preload(phases: { permissions: [:groups] })

    # Projects user can participate in, or where such participation could (probably) be made possible by user
    # (e.g. user not signed in).
    # Unfortunately, this breaks the query chain, so we have to start a new one after this.
    # Also, we will pass the action descriptors to the serializer to avoid needing to get them again when serializing,
    # so we will return them along with the filtered projects.

    # Step 1: Create pairs of project ids and action descriptors.
    # Since this is the last filtering step, we will keep going
    # until we reach the limit required for pagination.
    pagination_limit = calculate_pagination_limit(params)

    project_descriptor_pairs = {}
    filtered_projects = []

    projects.each do |project|
      service = Permissions::ProjectPermissionsService.new(
        project, current_user, user_requirements_service: user_requirements_service
      )
      action_descriptors = service.action_descriptors

      if Permissions::ProjectPermissionsService.participation_possible?(action_descriptors)
        project_descriptor_pairs[project.id] = action_descriptors
        filtered_projects << project
        break if project_descriptor_pairs.size >= pagination_limit
      end
    end

    # # Step 2: Use project_descriptor_pairs keys (project IDs) to filter projects
    projects = Project.where(id: project_descriptor_pairs.keys)

    # We need to join with active phases again here, to be able to order by their end dates.
    projects = projects_with_active_phase(projects)
      .order('phase_end_at ASC NULLS LAST')

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

  def calculate_pagination_limit(params)
    page_size = (params.dig(:page, :size) || 500).to_i
    page_number = (params.dig(:page, :number) || 1).to_i

    page_size * page_number
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new(check_groups_and_verification: false)
  end
end
